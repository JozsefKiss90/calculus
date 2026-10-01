// Invariants 1 to 4: the structural gate.
//
// These are computed from the graph alone, so they hold from the first commit — before
// any Note exists. Each is binary and blocking: a failure is red and fails the build.
//
// Invariant 3 is only ever violated alongside invariant 1. In a finite acyclic graph
// every path must end at a Node with no prerequisites, so the only way a path can fail to
// reach the Floor is to circle forever. It is still checked and still named separately,
// because "a Node that cannot reach the Floor" tells a reader which part of the Module is
// unlearnable, which a list of cycles does not.

import { findCycles, namesOf, nodesReachingFloor, reachableFrom } from "./graph.js";

const NO_TERMINAL_NODE = "the declared Terminal Node is not in the graph";

const INVARIANT = {
  acyclic: {
    id: 1,
    name: "acyclic",
    title: "The Edge graph is acyclic",
  },
  singleTerminalNode: {
    id: 2,
    name: "single-terminal-node",
    title: "Exactly one Node has in-degree zero, and it is the declared Terminal Node",
  },
  pathsTerminateAtTheFloor: {
    id: 3,
    name: "paths-terminate-at-the-floor",
    title: "Every path from the Terminal Node terminates at a Node with no prerequisites",
  },
  allNodesReachable: {
    id: 4,
    name: "all-nodes-reachable",
    title: "No Node is unreachable from the Terminal Node",
  },
};

/**
 * @param {object} graph
 * @param {{terminalNode: string}} declared the Module's declared Terminal Node, by name
 */
export function checkStructuralInvariants(graph, { terminalNode }) {
  const terminal = graph.byName(terminalNode);

  return [
    acyclic(graph),
    singleTerminalNode(graph, terminalNode, terminal),
    pathsTerminateAtTheFloor(graph, terminal),
    allNodesReachable(graph, terminal),
  ];
}

const verdict = (invariant, failures) => ({
  ...invariant,
  status: failures.length === 0 ? "pass" : "fail",
  failures,
});

const notChecked = (invariant, reason) => ({
  ...invariant,
  status: "skipped",
  reason,
  failures: [],
});

function acyclic(graph) {
  const cycles = findCycles(graph);

  return verdict(
    INVARIANT.acyclic,
    cycles.map((cycle) => ({
      message: `prerequisite cycle: ${cycle.map((node) => graph.nameOf(node)).join(" requires ")}`,
      nodes: cycle.map((node) => graph.nameOf(node)),
    })),
  );
}

function singleTerminalNode(graph, terminalNode, terminal) {
  const withNothingRequiringThem = namesOf(graph, graph.nodesWithNoDependents());
  const failures = [];

  if (!terminal) {
    failures.push({
      message: `the declared Terminal Node "${terminalNode}" is not in the graph`,
      nodes: [],
    });
  }
  if (withNothingRequiringThem.length !== 1) {
    failures.push({
      message: `${withNothingRequiringThem.length} Nodes have nothing requiring them, and a Module has exactly one: ${withNothingRequiringThem.join(", ")}`,
      nodes: withNothingRequiringThem,
    });
  } else if (terminal && withNothingRequiringThem[0] !== terminalNode) {
    failures.push({
      message: `the only Node with nothing requiring it is "${withNothingRequiringThem[0]}", but the declared Terminal Node is "${terminalNode}"`,
      nodes: withNothingRequiringThem,
    });
  }

  return verdict(INVARIANT.singleTerminalNode, failures);
}

function pathsTerminateAtTheFloor(graph, terminal) {
  if (!terminal) return notChecked(INVARIANT.pathsTerminateAtTheFloor, NO_TERMINAL_NODE);

  const reaching = nodesReachingFloor(graph);
  const stranded = namesOf(
    graph,
    [...reachableFrom(graph, terminal.id)].filter((node) => !reaching.has(node)),
  );

  return verdict(
    INVARIANT.pathsTerminateAtTheFloor,
    stranded.length === 0
      ? []
      : [
          {
            message: `${stranded.length} Nodes reachable from the Terminal Node never reach a Node with no prerequisites: ${stranded.join(", ")}`,
            nodes: stranded,
          },
        ],
  );
}

function allNodesReachable(graph, terminal) {
  if (!terminal) return notChecked(INVARIANT.allNodesReachable, NO_TERMINAL_NODE);

  const reachable = reachableFrom(graph, terminal.id);
  const unreachable = namesOf(
    graph,
    graph.nodes.filter((node) => !reachable.has(node.id)).map((node) => node.id),
  );

  return verdict(
    INVARIANT.allNodesReachable,
    unreachable.length === 0
      ? []
      : [
          {
            message: `${unreachable.length} Nodes are unreachable from the Terminal Node: ${unreachable.join(", ")}`,
            nodes: unreachable,
          },
        ],
  );
}
