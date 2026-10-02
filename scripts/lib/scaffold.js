// `scaffold`: one stub Note per Node, written from the Anchor Graph, so every prerequisite
// link resolves before any content exists.
//
// It only ever creates. A Note that already exists is never opened for writing, whatever
// its contents, so a second run is a no-op and a hand-edited Note is byte-identical after
// one. That includes a Note found in the wrong directory: scaffolding a second copy would
// give one Node two Notes, and putting it right is a human's move, flagged by `check`.
//
// Everything is planned before anything is written, so a refusal — a Node the Anchor Graph
// does not have, a Node with no domain, a name with no filename — leaves the vault as it was.

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export class ScaffoldError extends Error {}

/**
 * The eight sections, in order. Two are machine-owned: their markers are written now, empty,
 * and `generate` rewrites what lies between them on every run.
 */
const SECTIONS = [
  { heading: "In one sentence" },
  { heading: "Why you need this" },
  { heading: "The idea" },
  { heading: "Worked example" },
  { heading: "Common mistakes" },
  { heading: "Builds on", generated: "builds-on" },
  { heading: "Required by", generated: "required-by" },
  { heading: "References" },
];

/**
 * Characters a filename or a wikilink cannot hold, and how a name spells each out. Only `/`
 * has a spelling, because only `/` has one that reads as the mathematics did; anything else
 * is refused rather than given a spelling nobody chose.
 */
const SPELLED_OUT = { "/": "over" };
const ILLEGAL_IN_FILENAME = /[\\/:*?"<>|#^[\]]/g;

/**
 * The name of the Note that carries a Node: its name, with every character a filename
 * cannot hold spelled out. `requires` links to this, so it is also how a Note is linked.
 *
 * @returns {string | {unspellable: string[]}}
 */
function noteNameFor(nodeName) {
  const unspellable = [...new Set(nodeName.match(ILLEGAL_IN_FILENAME) ?? [])].filter(
    (character) => !(character in SPELLED_OUT),
  );
  if (unspellable.length > 0) return { unspellable };
  return nodeName.replace(ILLEGAL_IN_FILENAME, (character) => SPELLED_OUT[character]);
}

/**
 * @param {string} vaultDir
 * @param {object} anchor what `loadAnchorGraph` returned
 * @param {object} options
 * @param {string} options.terminalNode the Module's Terminal Node, by name
 * @param {string} options.terminalDomain the domain directory the Terminal Node's Note sits in
 * @param {Record<string, string>} options.domains Anchor Graph subgraph id to domain directory
 * @param {string[]} [options.nodeNames] Node names to scaffold; every Node when empty
 * @param {string} options.today the date written into `created` and `updated`
 * @returns {Promise<{created: string[], present: {path: string, expected: string}[]}>}
 */
export async function scaffold(vaultDir, anchor, { terminalNode, terminalDomain, domains, nodeNames = [], today }) {
  const notes = planNotes(anchor, { terminalNode, terminalDomain, domains });
  const selected = select(notes, nodeNames);
  const existing = await existingNotes(vaultDir);

  const created = [];
  const present = [];
  for (const note of selected) {
    const found = existing.get(`${note.name}.md`.toLowerCase());
    if (found) {
      present.push({ path: found, expected: note.path });
      continue;
    }
    await mkdir(join(vaultDir, note.domain), { recursive: true });
    // `wx`: never overwrite, even a Note that appeared since the directory was read.
    await writeFile(join(vaultDir, note.path), noteContents(note, today), { encoding: "utf8", flag: "wx" });
    created.push(note.path);
  }
  return { created, present };
}

/** Every Node's Note — its name, domain, path and links — or a refusal naming every problem. */
function planNotes({ graph, subgraphOf }, { terminalNode, terminalDomain, domains }) {
  const problems = [];
  const names = new Map();

  for (const node of graph.nodes) {
    const name = noteNameFor(node.name);
    if (typeof name === "string") names.set(node.id, name);
    else {
      problems.push(
        `"${node.name}" cannot be a filename: ${name.unspellable.map((c) => `"${c}"`).join(", ")} has no spelling`,
      );
    }
  }

  const firstWithFoldedName = new Map();
  for (const [id, name] of names) {
    // One folded name per Note: two names that differ only in case are one file on Windows.
    const folded = name.toLowerCase();
    if (firstWithFoldedName.has(folded)) {
      problems.push(`"${graph.nameOf(firstWithFoldedName.get(folded))}" and "${graph.nameOf(id)}" would both be ${name}.md`);
    }
    firstWithFoldedName.set(folded, id);
  }

  const notes = [];
  for (const node of graph.nodes) {
    const domain = domainOf(node, { subgraphOf, terminalNode, terminalDomain, domains }, problems);
    const name = names.get(node.id);
    if (domain === undefined || name === undefined) continue;
    notes.push({
      node: node.name,
      name,
      domain,
      path: `${domain}/${name}.md`,
      requires: graph.prerequisitesOf(node.id).map((id) => names.get(id) ?? graph.nameOf(id)),
      aliases: name === node.name ? [] : [node.name],
    });
  }

  if (problems.length > 0) throw new ScaffoldError(problems.join("\n"));
  return notes;
}

function domainOf(node, { subgraphOf, terminalNode, terminalDomain, domains }, problems) {
  const subgraph = subgraphOf(node.id);
  if (subgraph === undefined) {
    if (node.name === terminalNode) return terminalDomain;
    problems.push(`"${node.name}" is in no subgraph of the Anchor Graph, so it has no domain`);
    return undefined;
  }
  if (!Object.hasOwn(domains, subgraph)) {
    problems.push(`"${node.name}" is in subgraph ${subgraph}, which is not a domain directory`);
    return undefined;
  }
  return domains[subgraph];
}

function select(notes, nodeNames) {
  if (nodeNames.length === 0) return notes;

  const byName = new Map();
  for (const note of notes) {
    byName.set(note.node, note);
    byName.set(note.name, note);
  }
  const absent = nodeNames.filter((name) => !byName.has(name));
  if (absent.length > 0) {
    throw new ScaffoldError(
      absent.map((name) => `"${name}" is not a Node in the Anchor Graph`).join("\n"),
    );
  }
  return [...new Set(nodeNames.map((name) => byName.get(name)))];
}

/**
 * The Notes already in the vault, by case-folded filename, at the root or one directory
 * down. Folded because a name that differs only in case is the same file on Windows and
 * macOS and the same link target in Obsidian everywhere, so it is the same Note.
 */
async function existingNotes(vaultDir) {
  const existing = new Map();
  for (const entry of await readdir(vaultDir, { withFileTypes: true })) {
    if (entry.isFile()) existing.set(entry.name.toLowerCase(), entry.name);
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    for (const inner of await readdir(join(vaultDir, entry.name), { withFileTypes: true })) {
      if (inner.isFile() && !existing.has(inner.name.toLowerCase())) {
        existing.set(inner.name.toLowerCase(), `${entry.name}/${inner.name}`);
      }
    }
  }
  return existing;
}

function noteContents(note, today) {
  const list = (key, values) =>
    values.length === 0 ? `${key}: []` : [`${key}:`, ...values.map((value) => `  - ${value}`)].join("\n");
  // Double-quoted, so a comma, a colon or an apostrophe in a name stays one YAML scalar;
  // a double quote or backslash never reaches here, because neither can be in a filename.
  const quoted = (text) => `"${text}"`;

  const frontmatter = [
    "kind: concept",
    `domain: ${note.domain}`,
    list("requires", note.requires.map((name) => quoted(`[[${name}]]`))),
    "status: stub",
    "reviewed_by: none",
    `created: ${today}`,
    `updated: ${today}`,
    ...(note.aliases.length > 0 ? [list("aliases", note.aliases.map(quoted))] : []),
  ];

  const sections = SECTIONS.map(({ heading, generated }) =>
    generated
      ? `## ${heading}\n\n<!-- generated:start ${generated} -->\n<!-- generated:end ${generated} -->\n`
      : `## ${heading}\n`,
  );

  return `---\n${frontmatter.join("\n")}\n---\n\n${sections.join("\n")}`;
}
