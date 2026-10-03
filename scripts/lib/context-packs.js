// Context Packs: the briefing a Note Author reads instead of the Wiki (ADR-0005).
//
// One Pack per Node in a named Layer, where a Layer is computed from the graph the Notes
// declare — the longest path to the Floor — and never read from anywhere. A Pack carries
// exactly these sections, in this order, and nothing else:
//
//   Node                 the Node's name and domain
//   Skeleton             the Note as it stands: the file the author writes into
//   Builds on            each prerequisite's one-sentence summary
//   Required by          each requiring Node's one-sentence summary
//   Archetype catalogue  each Archetype's name and one-liner, not its schema
//   House style          docs/house-style.md, whole
//   Notation authority   the vault's Conventions.md, whole
//   Sources              the source Notes tagged with the Node's domain, whole — or which of
//                        the two reasons there are none
//
// Packs are written beside the vault, in `.context-packs/layer-<N>/`, never inside it: a
// Pack is a transient input, not learning content. Each run replaces the Layer's directory,
// so a Pack for a Node that has since left the Layer cannot linger and be picked up.
//
// Whole files are fenced rather than pasted bare, so their own headings cannot be mistaken
// for the Pack's sections. Inside a fence the text is the file's own, with LF line endings.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { layersOf } from "./graph.js";
import { buildNotesGraph, isConcept, summaryOf, valueOf } from "./notes.js";

const HOUSE_STYLE_PATH = fileURLToPath(new URL("../../docs/house-style.md", import.meta.url));
export const NOTATION_AUTHORITY = "Conventions.md";

/** Where a Layer's Packs go, relative to the directory holding the vault. */
const packDirectory = (layer) => posix.join(".context-packs", `layer-${layer}`);

export class PackError extends Error {}

/**
 * Write the Packs for every Node in one Layer.
 *
 * @param {string} vaultDir
 * @param {Awaited<ReturnType<typeof import("./notes.js").loadNotes>>} notes
 * @param {import("./archetype-catalogue.js").Catalogue} catalogue
 * @param {number} layer
 * @returns {Promise<{layer: number, layerCount: number, directory: string, written: string[]}>}
 *   `directory` and `written` relative to the directory holding the vault
 * @throws {PackError} when the Layer does not exist or a file every Pack carries is missing;
 *   nothing is written then
 * @throws {import("./graph.js").GraphError} when the Notes do not form a graph
 */
export async function writeContextPacks(vaultDir, notes, catalogue, layer) {
  const graph = buildNotesGraph(notes);
  const layers = layersOf(graph);
  const layerCount = Math.max(-1, ...[...layers.values()].filter((value) => value !== undefined)) + 1;
  if (!(layer < layerCount)) {
    const range = layerCount === 0 ? "none" : `${layerCount} ${layerCount === 1 ? "Layer" : "Layers"}, 0 to ${layerCount - 1}`;
    throw new PackError(`there is no Layer ${layer}: the graph has ${range}`);
  }

  const vaultName = basename(resolve(vaultDir));
  const shared = {
    vaultName,
    catalogue: [...catalogue.archetypes.values()].map(({ name, oneLiner }) => `- \`${name}\` — ${oneLiner}`),
    houseStyle: await required(HOUSE_STYLE_PATH, "docs/house-style.md, the house style"),
    notation: await required(join(vaultDir, NOTATION_AUTHORITY), `${vaultName}/${NOTATION_AUTHORITY}, the notation authority`),
    sources: await Promise.all(
      notes
        .filter((note) => valueOf(note, "kind") === "source")
        .map(async (note) => ({ note, text: await readFile(join(vaultDir, note.path), "utf8") })),
    ),
  };

  const byPath = new Map(notes.map((note) => [note.path, note]));
  const byName = (a, b) => (graph.nameOf(a) < graph.nameOf(b) ? -1 : graph.nameOf(a) > graph.nameOf(b) ? 1 : 0);
  const members = notes.filter((note) => isConcept(note) && layers.get(note.path) === layer);

  const packs = [];
  for (const note of members) {
    packs.push({
      file: `${note.name}.md`,
      text: pack({
        note,
        skeleton: await readFile(join(vaultDir, note.path), "utf8"),
        prerequisites: graph.prerequisitesOf(note.path).map((id) => byPath.get(id)),
        dependents: [...graph.dependentsOf(note.path)].sort(byName).map((id) => byPath.get(id)),
        ...shared,
      }),
    });
  }

  const directory = packDirectory(layer);
  const absolute = join(vaultDir, "..", directory);
  await rm(absolute, { recursive: true, force: true });
  await mkdir(absolute, { recursive: true });
  for (const { file, text } of packs) await writeFile(join(absolute, file), text, "utf8");

  return { layer, layerCount, directory, written: packs.map(({ file }) => posix.join(directory, file)) };
}

function pack({ note, skeleton, prerequisites, dependents, vaultName, catalogue, houseStyle, notation, sources }) {
  const domain = valueOf(note, "domain");
  const oneLiner = (neighbour) => `- **${neighbour.name}** — ${summaryOf(neighbour) || "*no one-sentence summary written yet*"}`;
  const floor = prerequisites.length === 0;

  return [
    `# Context Pack: ${note.name}`,
    "## Node",
    `- **Name:** ${note.name}\n- **Domain:** ${domain}`,
    "## Skeleton",
    `The Note you write is \`${vaultName}/${note.path}\`. As it stands:`,
    fence(skeleton),
    "## Builds on",
    floor ? "Nothing: this is a Floor Node, knowledge the Module assumes." : prerequisites.map(oneLiner).join("\n"),
    "## Required by",
    dependents.length === 0 ? "Nothing in this Module requires it." : dependents.map(oneLiner).join("\n"),
    "## Archetype catalogue",
    catalogue.join("\n"),
    "## House style",
    fence(houseStyle),
    "## Notation authority",
    `\`${vaultName}/${NOTATION_AUTHORITY}\`, whole:`,
    fence(notation),
    "## Sources",
    ...sourcesSection({ floor, domain, vaultName, sources }),
  ].join("\n\n") + "\n";
}

/**
 * The sources section always says why it is what it is. An empty section is right for a
 * Floor Node, whose claims are the knowledge the Module assumes; it is a gap anywhere else,
 * and an author who cannot tell the two apart takes the generous reading and writes uncited.
 */
function sourcesSection({ floor, domain, vaultName, sources }) {
  if (floor) {
    return ["No sources apply. This is a Floor Node: its claims are 8th-grade knowledge the Module assumes, and need no citation."];
  }
  const tagged = sources.filter(({ note }) => [valueOf(note, "tags") ?? []].flat().includes(domain));
  if (tagged.length === 0) {
    return [
      `No source Note exists yet for the ${domain} domain. Claims in this Note that need a source have none to cite: ` +
        "report each one when you hand the Note back, rather than writing it uncited.",
    ];
  }
  return [
    `The source Notes for the ${domain} domain, whole:`,
    ...tagged.flatMap(({ note, text }) => [`\`${vaultName}/${note.path}\`:`, fence(text)]),
  ];
}

/** A whole file as a fenced block, the fence longer than any backtick run inside it. */
export function fence(text) {
  const body = text.replace(/\r\n/g, "\n").replace(/\n*$/, "\n");
  const longest = Math.max(0, ...[...body.matchAll(/`+/g)].map(([run]) => run.length));
  const marker = "`".repeat(Math.max(4, longest + 1));
  return `${marker}markdown\n${body}${marker}`;
}

async function required(path, what) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") throw new PackError(`${what}, does not exist, and every Pack carries it whole`);
    throw error;
  }
}
