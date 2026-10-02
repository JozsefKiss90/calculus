import { test } from "node:test";
import assert from "node:assert/strict";
import { makeFixtureVault, runWiki, readReport } from "./helpers/vault.js";

const CLEAN_GRAPH = `
flowchart TD
    D["Derivative"] --> L["Limits"]
    L --> NUM["Decimals, ordering, and number lines"]
`;

test("check on a clean Anchor Graph exits zero and reports the graph's shape", async () => {
  const { root, vault } = await makeFixtureVault(CLEAN_GRAPH);

  const { exitCode } = await runWiki(["check", vault]);
  const report = await readReport(root);

  assert.equal(exitCode, 0);
  assert.equal(report.status, "pass");
  assert.deepEqual(report.graph, {
    source: "anchor",
    note: "Module 1 Anchor Graph.md",
    nodes: 3,
    edges: 2,
    declaredTerminalNode: "Derivative",
    nodesWithNoDependents: ["Derivative"],
    floorNodes: 1,
    reachableNodes: 3,
  });
});

test("the report is readable from a terminal and names every invariant it checked", async () => {
  const { root, vault } = await makeFixtureVault(CLEAN_GRAPH);

  await runWiki(["check", vault]);
  const report = await readReport(root);

  assert.deepEqual(
    report.invariants.map((entry) => [entry.id, entry.status]),
    [
      [1, "pass"],
      [2, "pass"],
      [3, "pass"],
      [4, "pass"],
      [5, "pass"],
      [6, "pass"],
      [7, "pass"],
      [8, "pass"],
      [10, "pass"],
      [11, "skipped"],
    ],
  );
  for (const entry of report.invariants) {
    assert.ok(entry.title.length > 0, `invariant ${entry.id} has no title`);
    assert.deepEqual(entry.failures, []);
  }
});

test("the human summary prints the graph's shape and the invariant results", async () => {
  const { vault } = await makeFixtureVault(CLEAN_GRAPH);

  const { stdout } = await runWiki(["check", vault]);

  assert.match(stdout, /3 Nodes, 2 Edges, 1 Floor Node/);
  assert.match(stdout, /Declared Terminal Node: Derivative/);
  assert.match(stdout, /Nodes nothing requires: Derivative/);
  assert.match(stdout, /3 of 3 Nodes reachable/);
  assert.match(stdout, /9 of 9 invariants hold, 1 not checked/);
});
