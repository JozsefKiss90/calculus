// One in-memory representation of a prerequisite graph.
//
// A front-end turns a source of truth into declarations — Nodes with names, and Edges
// between them — and `buildGraph` turns declarations into the graph every check and
// every generated section reads. The Anchor Graph's mermaid block is the first
// front-end; the Notes' frontmatter is the second, and it builds the same graph through
// this same function rather than a graph of its own (ADR-0002).
//
// Edge direction follows the Anchor Graph: an Edge points at the prerequisite, so
// `from` requires `to`. A Node's prerequisites are its outgoing Edges and its
// dependents are its incoming ones.

export class GraphError extends Error {}

/**
 * @typedef {{id: string, name?: string, origin?: string}} NodeDeclaration
 * @typedef {{from: string, to: string, origin?: string}} EdgeDeclaration
 */

/**
 * @param {{nodes?: NodeDeclaration[], edges?: EdgeDeclaration[]}} declarations
 */
export function buildGraph({ nodes = [], edges = [] }) {
  const byId = new Map();
  const declare = ({ id, name, origin }) => {
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, { id, name: name ?? id, named: name !== undefined, origin });
      return;
    }
    if (name === undefined) return;
    if (existing.named && existing.name !== name) {
      throw new GraphError(
        `Node ${id} is named both "${existing.name}" (${existing.origin}) and "${name}" (${origin})`,
      );
    }
    existing.name = name;
    existing.named = true;
  };

  for (const node of nodes) declare(node);
  for (const edge of edges) {
    declare({ id: edge.from, origin: edge.origin });
    declare({ id: edge.to, origin: edge.origin });
  }

  const byName = new Map();
  for (const node of byId.values()) {
    const clash = byName.get(node.name);
    if (clash) {
      throw new GraphError(`two Nodes share the name "${node.name}": ${clash.id} and ${node.id}`);
    }
    byName.set(node.name, node);
  }

  const prerequisites = new Map([...byId.keys()].map((id) => [id, []]));
  const dependents = new Map([...byId.keys()].map((id) => [id, []]));
  const declared = new Map();
  for (const edge of edges) {
    const key = `${edge.from} ${edge.to}`;
    const first = declared.get(key);
    if (first) {
      throw new GraphError(
        `the Edge ${byId.get(edge.from).name} requires ${byId.get(edge.to).name} is declared twice, at ${first} and ${edge.origin}`,
      );
    }
    declared.set(key, edge.origin);
    prerequisites.get(edge.from).push(edge.to);
    dependents.get(edge.to).push(edge.from);
  }

  return {
    nodes: [...byId.values()].map(({ id, name, origin }) => ({ id, name, origin })),
    edges: edges.map(({ from, to, origin }) => ({ from, to, origin })),

    /** The human name of a Node — a Note's name once the Notes are the front-end. */
    nameOf: (id) => byId.get(id)?.name ?? id,
    byName: (name) => byName.get(name),

    /** The Nodes this one requires. */
    prerequisitesOf: (id) => prerequisites.get(id) ?? [],
    /** The Nodes that require this one. */
    dependentsOf: (id) => dependents.get(id) ?? [],

    /** Nodes nothing requires. A well-formed Module has exactly one: its Terminal Node. */
    nodesWithNoDependents: () => [...byId.keys()].filter((id) => dependents.get(id).length === 0),
    /** Nodes that require nothing — the Module's assumed-knowledge boundary. */
    floorNodes: () => [...byId.keys()].filter((id) => prerequisites.get(id).length === 0),
  };
}

/** The counts and names the report states about a graph, independent of any invariant. */
export function graphShape(graph, declaredTerminalNode) {
  const terminal = graph.byName(declaredTerminalNode);

  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    declaredTerminalNode,
    nodesWithNoDependents: namesOf(graph, graph.nodesWithNoDependents()),
    floorNodes: graph.floorNodes().length,
    reachableNodes: terminal ? reachableFrom(graph, terminal.id).size : 0,
  };
}

/** Node names, sorted, for a report a human reads and an agent parses. */
export function namesOf(graph, ids) {
  return [...ids].map((id) => graph.nameOf(id)).sort();
}

/** Every Node reachable by following Edges from `startId`, including `startId` itself. */
export function reachableFrom(graph, startId) {
  const seen = new Set();
  const stack = [startId];
  while (stack.length > 0) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...graph.prerequisitesOf(id));
  }
  return seen;
}

/**
 * Every cycle in the graph, each as a list of Node ids returning to its start. One cycle
 * is reported per entry point found, which is enough to name the problem.
 */
export function findCycles(graph) {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const colour = new Map(graph.nodes.map((node) => [node.id, WHITE]));
  const cycles = [];

  const walk = (id, path) => {
    colour.set(id, GREY);
    path.push(id);
    for (const next of graph.prerequisitesOf(id)) {
      if (colour.get(next) === GREY) {
        cycles.push([...path.slice(path.indexOf(next)), next]);
      } else if (colour.get(next) === WHITE) {
        walk(next, path);
      }
    }
    path.pop();
    colour.set(id, BLACK);
  };

  for (const node of graph.nodes) {
    if (colour.get(node.id) === WHITE) walk(node.id, []);
  }
  return cycles;
}

/**
 * Every Node from which some path reaches a Node with no prerequisites. Walked backwards
 * from the Floor Nodes, so a Node trapped in a cycle is simply never reached.
 */
export function nodesReachingFloor(graph) {
  const reaching = new Set();
  const queue = graph.floorNodes();
  while (queue.length > 0) {
    const id = queue.pop();
    if (reaching.has(id)) continue;
    reaching.add(id);
    queue.push(...graph.dependentsOf(id));
  }
  return reaching;
}
