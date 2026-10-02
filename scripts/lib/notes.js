// The Notes front-end: the vault's Notes turned into graph declarations.
//
// The second front-end ADR-0002 names. Each concept Note is a Node, named by its filename,
// and each `requires` wikilink that resolves to a concept Note is an Edge. Both go through
// the same `buildGraph` the Anchor Graph does, so there is still one graph builder.
//
// What counts as a Note is decided by content, never by a list of names. A file with no
// frontmatter is structural (`CLAUDE.md`, `index.md`, `log.md`) and is not a Note at all. A
// Note with frontmatter is a Node only when it is `kind: concept`: the Anchor Graph Note
// (`kind: reference`), the dashboard and source Notes all carry frontmatter and none of
// them is a Node.
//
// A `requires` entry that does not resolve is left out of the graph rather than declared
// as a Node, so a deleted Note shows up in invariant 11 as a missing Node instead of being
// silently recreated by the links that still point at it. Invariant 5 names the link.

import { readdir, readFile } from "node:fs/promises";
import { basename, join, posix, resolve } from "node:path";
import { readFrontmatter } from "./frontmatter.js";
import { buildGraph } from "./graph.js";

export const CONCEPT = "concept";

/**
 * Every Note in the vault — every `.md` file carrying frontmatter — in path order.
 * Directories whose names start with a dot (`.obsidian`, `.smart-env`) are not content.
 *
 * @param {string} vaultDir
 * @returns {Promise<{
 *   path: string,
 *   name: string,
 *   directory: string,
 *   frontmatter: import("./frontmatter.js").Frontmatter,
 * }[]>}
 */
export async function loadNotes(vaultDir) {
  const vaultName = basename(resolve(vaultDir));
  const notes = [];
  for (const path of (await vaultFiles(vaultDir)).filter((file) => file.endsWith(".md"))) {
    const frontmatter = readFrontmatter(await readFile(join(vaultDir, path), "utf8"));
    if (frontmatter === null) continue;
    const directory = posix.dirname(path);
    notes.push({
      path,
      name: posix.basename(path, ".md"),
      // The basename of the directory holding the Note: the vault's own name at the root.
      directory: directory === "." ? vaultName : posix.basename(directory),
      frontmatter,
    });
  }
  return notes;
}

/**
 * Every file in the vault as a vault-relative path, in path order: what a wikilink can
 * resolve to, Markdown or attachment. Dot-directories are not content.
 */
export async function vaultFiles(vaultDir) {
  return filesUnder(vaultDir, "");
}

async function filesUnder(vaultDir, relativeDir) {
  const found = [];
  const entries = await readdir(join(vaultDir, relativeDir), { withFileTypes: true });
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    if (entry.name.startsWith(".")) continue;
    const path = relativeDir === "" ? entry.name : `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await filesUnder(vaultDir, path)));
    else if (entry.isFile()) found.push(path);
  }
  return found;
}

/** A frontmatter value, or undefined when the key is absent or could not be read. */
export function valueOf(note, key) {
  const entry = note.frontmatter.entries.get(key);
  return entry && !entry.unreadable ? entry.value : undefined;
}

export const isConcept = (note) => valueOf(note, "kind") === CONCEPT;

export const SUMMARY_HEADING = "In one sentence";

/**
 * A Note's one-sentence summary: the text under `## In one sentence`, up to the next heading
 * of level one or two, as one line. HTML comments are removed, because a comment is nothing
 * a reader or a Context Pack can use. Undefined when the Note has no such heading.
 */
export function summaryOf(note) {
  const lines = note.frontmatter.body.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+(.*?)\s*#*\s*$/.exec(line)?.[1] === SUMMARY_HEADING);
  if (start === -1) return undefined;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^#{1,2}\s/.test(line));
  return (end === -1 ? rest : rest.slice(0, end))
    .join("\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The Note a wikilink names. Resolved the way Obsidian resolves it: by Note name, ignoring
 * case, any folder path, `#heading` or `|display text`.
 *
 * @returns {{target: string} & ({notes: object[]} | {notWikilink: true})}
 */
export function resolveLink(entry, notesByName) {
  const link = /^\[\[([^\]]*)\]\]$/.exec(entry.trim());
  if (!link) return { target: entry, notWikilink: true };
  const target = linkTarget(link[1]);
  return { target, notes: notesByName.get(target.toLowerCase()) ?? [] };
}

/**
 * The name a wikilink's inside points at: without `|display text`, `#heading`, folder path
 * or `.md`. Empty for `[[#heading]]`, which points into the Note it is written in.
 */
export function linkTarget(inside) {
  return inside.split("|")[0].split("#")[0].trim().split("/").at(-1).replace(/\.md$/i, "");
}

/** Every Note by case-folded name; more than one under a name is an ambiguous link target. */
export function indexByName(notes) {
  const byName = new Map();
  for (const note of notes) {
    const key = note.name.toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), note]);
  }
  return byName;
}

/**
 * The graph the Notes declare: concept Notes as Nodes, and each `requires` entry that
 * resolves to exactly one concept Note as an Edge. A prerequisite listed twice is one Edge;
 * invariant 7 is what names the repetition.
 *
 * @throws {import("./graph.js").GraphError} when two concept Notes share a name
 */
export function buildNotesGraph(notes) {
  const concepts = notes.filter(isConcept);
  const byName = indexByName(concepts);
  const edges = [];

  for (const note of concepts) {
    const requires = valueOf(note, "requires");
    if (!Array.isArray(requires)) continue;
    const seen = new Set();
    for (const entry of requires) {
      const resolved = resolveLink(entry, byName);
      if (resolved.notWikilink || resolved.notes.length !== 1) continue;
      const [target] = resolved.notes;
      if (seen.has(target.path)) continue;
      seen.add(target.path);
      edges.push({ from: note.path, to: target.path, origin: note.path });
    }
  }

  return buildGraph({
    nodes: concepts.map((note) => ({ id: note.path, name: note.name, origin: note.path })),
    edges,
  });
}
