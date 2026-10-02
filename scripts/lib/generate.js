// `generate`: the reverse direction of every Edge, written into the Notes by script.
//
// A Note declares what it requires and nothing else (ADR-0003). This fills each concept
// Note's three machine-owned blocks from the graph the Notes declare — the same graph
// `check` holds to the Anchor Graph, built by the same `buildNotesGraph`:
//
//   builds-on    each direct prerequisite as a wikilink, with its one-sentence summary
//   required-by  each direct dependent as a wikilink, with its one-sentence summary
//   mini-map     a `flowchart TD` of the Note, its prerequisites and its dependents
//
// It reads `requires` and never writes it, and it writes nothing outside the markers. Every
// block is a pure function of the graph and the summaries, so a second run is a no-op and a
// graph change shows up as a diff in exactly the Notes whose neighbourhood changed.
//
// The mini-map's arrows point at the prerequisite, the Anchor Graph's own convention:
// `A --> B` reads "A requires B".

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { rewriteBlocks } from "./generated-blocks.js";
import { buildNotesGraph, isConcept, summaryOf } from "./notes.js";

/**
 * @param {string} vaultDir
 * @param {Awaited<ReturnType<typeof import("./notes.js").loadNotes>>} notes
 * @returns {Promise<{updated: string[], unchanged: string[], refused: {path: string, problems: string[]}[]}>}
 * @throws {import("./graph.js").GraphError} when the Notes do not form a graph
 */
export async function generate(vaultDir, notes) {
  const graph = buildNotesGraph(notes);
  const byPath = new Map(notes.map((note) => [note.path, note]));
  const link = (id) => {
    const summary = summaryOf(byPath.get(id)) ?? "";
    return summary === "" ? `- [[${graph.nameOf(id)}]]` : `- [[${graph.nameOf(id)}]] — ${summary}`;
  };
  const byName = (a, b) => (graph.nameOf(a) < graph.nameOf(b) ? -1 : graph.nameOf(a) > graph.nameOf(b) ? 1 : 0);

  const updated = [];
  const unchanged = [];
  const refused = [];

  for (const note of notes.filter(isConcept)) {
    // In the order the Note lists them, which is the author's order of reading.
    const prerequisites = graph.prerequisitesOf(note.path);
    const dependents = [...graph.dependentsOf(note.path)].sort(byName);

    const blocks = [
      {
        name: "builds-on",
        content:
          prerequisites.length === 0
            ? "*Nothing: this is a Floor Node, knowledge the Module assumes.*"
            : prerequisites.map(link).join("\n"),
      },
      {
        name: "required-by",
        content:
          dependents.length === 0 ? "*Nothing in this Module requires it.*" : dependents.map(link).join("\n"),
      },
      { name: "mini-map", after: "required-by", content: miniMap(graph, note.path, prerequisites, dependents) },
    ];

    const file = join(vaultDir, note.path);
    const source = await readFile(file, "utf8");
    const result = rewriteBlocks(source, blocks);
    if (result.problems) {
      refused.push({ path: note.path, problems: result.problems });
    } else if (result.text === source) {
      unchanged.push(note.path);
    } else {
      await writeFile(file, result.text, "utf8");
      updated.push(note.path);
    }
  }

  return { updated, unchanged, refused };
}

/**
 * The Note and its direct neighbours, each a clickable link in Obsidian (`internal-link`
 * makes a mermaid Node open the Note its label names). The Note itself is drawn heavier.
 */
function miniMap(graph, id, prerequisites, dependents) {
  // Names never hold a double quote — it cannot be in a filename — so quoting is enough.
  const label = (nodeId) => `["${graph.nameOf(nodeId)}"]`;
  const self = "N";
  const lines = ["```mermaid", "flowchart TD", `    ${self}${label(id)}`];
  const ids = [self];

  prerequisites.forEach((prerequisite, index) => {
    const key = `P${index + 1}`;
    lines.push(`    ${self} --> ${key}${label(prerequisite)}`);
    ids.push(key);
  });
  dependents.forEach((dependent, index) => {
    const key = `D${index + 1}`;
    lines.push(`    ${key}${label(dependent)} --> ${self}`);
    ids.push(key);
  });

  lines.push(`    class ${ids.join(",")} internal-link`, `    style ${self} stroke-width:3px`, "```");
  return lines.join("\n");
}
