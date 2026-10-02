// The Anchor Graph front-end: the vault's Anchor Graph Note turned into graph
// declarations.
//
// The graph lives in a fenced `mermaid` block inside a Note, not in a bare `.mmd` file,
// so the fence is stripped and the block parsed. Node ids are the short uppercase keys
// (`D`, `AE`, `SINL`); a Node's human name is the bracketed label, declared at its first
// appearance and omitted on later mentions, so names accumulate across the block.
// `subgraph` lines are grouping rather than Nodes, and an Edge's `-->|"label"|` pill is
// commentary that carries no structural meaning.
//
// Grouping is not structure, but it is not nothing either: the subgraphs are the Wiki's
// domain directories, so the loader records which one each Node belongs to. A Node
// belongs to the subgraph it is named in; a Node named outside every subgraph — a
// domain's head Node, named on the Terminal Node's line — belongs to the first subgraph
// it appears in. No invariant reads it.
//
// The accepted dialect is deliberately narrow. An unrecognised line is an error naming
// the line, because a loader that silently skips what it does not understand loses Edges
// and reports a smaller graph than the one a human reviewed.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildGraph } from "./graph.js";

export class AnchorGraphError extends Error {}

const ANCHOR_NOTE_SUFFIX = " Anchor Graph.md";

/**
 * Load the vault's Anchor Graph.
 *
 * @param {string} vaultDir
 * @returns {Promise<{
 *   note: string,
 *   graph: ReturnType<typeof buildGraph>,
 *   subgraphOf: (id: string) => string | undefined,
 * }>}
 */
export async function loadAnchorGraph(vaultDir) {
  const note = await findAnchorNote(vaultDir);
  const source = await readFile(join(vaultDir, note), "utf8");
  const block = extractMermaidBlock(source, note);
  const declarations = parseMermaid(block, note);
  const membership = subgraphMembership(declarations.nodes);
  return {
    note,
    graph: buildGraph(declarations),
    /** The id of the subgraph a Node belongs to, or undefined for a Node in none. */
    subgraphOf: (id) => membership.get(id),
  };
}

/** Each Node's subgraph: where it is named, else the first one it appears in. */
function subgraphMembership(mentions) {
  const membership = new Map();
  const namedInside = new Set();
  for (const { id, name, subgraph } of mentions) {
    if (subgraph === undefined || namedInside.has(id)) continue;
    if (name !== undefined) {
      membership.set(id, subgraph);
      namedInside.add(id);
    } else if (!membership.has(id)) {
      membership.set(id, subgraph);
    }
  }
  return membership;
}

async function findAnchorNote(vaultDir) {
  let entries;
  try {
    entries = await readdir(vaultDir, { withFileTypes: true });
  } catch (cause) {
    throw new AnchorGraphError(`cannot read the vault directory ${vaultDir}: ${cause.message}`);
  }

  const candidates = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(ANCHOR_NOTE_SUFFIX))
    .map((entry) => entry.name)
    .sort();

  if (candidates.length === 0) {
    throw new AnchorGraphError(
      `no Anchor Graph in ${vaultDir}: expected a file named "<Module> Anchor Graph.md" at the vault root`,
    );
  }
  if (candidates.length > 1) {
    throw new AnchorGraphError(
      `${vaultDir} holds more than one Anchor Graph: ${candidates.join(", ")}`,
    );
  }
  return candidates[0];
}

/** The contents of the Note's single fenced `mermaid` block, with its source line numbers. */
function extractMermaidBlock(source, note) {
  const lines = source.split(/\r?\n/);
  const opens = [];
  const closes = [];

  for (const [index, line] of lines.entries()) {
    if (/^\s*```mermaid\s*$/.test(line)) opens.push(index);
    else if (opens.length > 0 && closes.length < opens.length && /^\s*```\s*$/.test(line)) {
      closes.push(index);
    }
  }

  if (opens.length === 0) throw new AnchorGraphError(`${note} has no fenced mermaid block`);
  if (opens.length > 1) {
    throw new AnchorGraphError(
      `${note} has ${opens.length} fenced mermaid blocks; the Anchor Graph must be the only one`,
    );
  }
  if (closes.length === 0) throw new AnchorGraphError(`${note}'s mermaid block is never closed`);

  return lines.slice(opens[0] + 1, closes[0]).map((text, offset) => ({
    text,
    // 1-based, and the fence line itself is line opens[0] + 1
    number: opens[0] + 2 + offset,
  }));
}

function parseMermaid(block, note) {
  const nodes = [];
  const edges = [];
  const open = [];

  for (const line of block) {
    const text = line.text.trim();
    const origin = `${note}:${line.number}`;

    if (text === "" || text.startsWith("%%")) continue;
    if (/^(flowchart|graph)\b/.test(text)) continue;

    const subgraph = SUBGRAPH.exec(text);
    if (subgraph) {
      open.push(subgraph[1]);
      continue;
    }
    if (text === "end") {
      if (open.length === 0) throw new AnchorGraphError(`${origin}: "end" closes no subgraph`);
      open.pop();
      continue;
    }

    const parsed = parseGraphLine(text, origin);
    if (!parsed) {
      throw new AnchorGraphError(`${origin}: cannot read this line of the Anchor Graph: ${text}`);
    }
    nodes.push(...parsed.nodes.map((node) => ({ ...node, subgraph: open.at(-1) })));
    edges.push(...parsed.edges);
  }

  if (edges.length === 0 && nodes.length === 0) {
    throw new AnchorGraphError(`${note}'s mermaid block declares no Nodes`);
  }
  return { nodes, edges };
}

const SUBGRAPH = /^subgraph\s+([A-Za-z][A-Za-z0-9_-]*)/;
const NODE_REF = /^([A-Za-z][A-Za-z0-9_-]*)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})?\s*/;
const ARROW = /^-->\s*(?:\|(.*?)\|)?\s*/;

/** One line of mermaid: a Node on its own, or a chain of Nodes joined by `-->` arrows. */
function parseGraphLine(text, origin) {
  const nodes = [];
  const edges = [];

  let rest = text;
  let previous = null;

  while (rest.length > 0) {
    if (previous !== null) {
      const arrow = ARROW.exec(rest);
      if (!arrow) return null;
      rest = rest.slice(arrow[0].length);
    }

    const ref = NODE_REF.exec(rest);
    if (!ref) return null;
    rest = rest.slice(ref[0].length);

    const [, id, ...labels] = ref;
    const label = labels.find((candidate) => candidate !== undefined);
    nodes.push({ id, name: label === undefined ? undefined : unquote(label), origin });
    if (previous !== null) edges.push({ from: previous, to: id, origin });
    previous = id;
  }

  return previous === null ? null : { nodes, edges };
}

function unquote(label) {
  const trimmed = label.trim();
  const quoted = /^"(.*)"$/.exec(trimmed) ?? /^'(.*)'$/.exec(trimmed);
  return (quoted ? quoted[1] : trimmed).trim();
}
