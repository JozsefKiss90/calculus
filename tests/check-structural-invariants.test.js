import { test } from "node:test";
import assert from "node:assert/strict";
import { makeFixtureVault, runWiki, readReport, invariant } from "./helpers/vault.js";

// A graph that satisfies all four structural invariants: acyclic, one Node with nothing
// requiring it and it is the declared Terminal Node, every path down to a Node with no
// prerequisites, nothing stranded. Each invariant's violating fixture is this graph with
// one thing broken.
const SOUND_GRAPH = `
flowchart TD
    D["Derivative"] --> L["Limits"]
    D --> A["Algebra"]
    L --> NUM["Decimals, ordering, and number lines"]
    A --> NUM
`;

async function check(graph) {
  const { root, vault } = await makeFixtureVault(graph);
  const { exitCode, stdout, stderr } = await runWiki(["check", vault]);
  return { exitCode, stdout, stderr, report: await readReport(root) };
}

test("a graph satisfying all four invariants passes every one of them", async () => {
  const { exitCode, report } = await check(SOUND_GRAPH);

  assert.equal(exitCode, 0);
  assert.equal(report.summary.invariantsFailed, 0);
});

test("invariant 1: a prerequisite cycle fails the check and is named", async () => {
  const { exitCode, report, stdout } = await check(`
flowchart TD
    D["Derivative"] --> L["Limits"]
    L --> A["Algebra"]
    A --> L
    L --> NUM["Decimals, ordering, and number lines"]
  `);

  assert.notEqual(exitCode, 0);
  assert.equal(report.status, "fail");

  const acyclic = invariant(report, 1);
  assert.equal(acyclic.status, "fail");
  assert.equal(acyclic.name, "acyclic");
  assert.match(acyclic.failures[0].message, /cycle/i);
  assert.deepEqual(new Set(acyclic.failures[0].nodes), new Set(["Limits", "Algebra"]));

  // The other three still hold: the cycle is the only thing wrong.
  assert.deepEqual(
    report.invariants.filter((entry) => entry.status === "fail").map((entry) => entry.id),
    [1],
  );
  assert.match(stdout, /cycle/i);
});

test("invariant 2: two Nodes with nothing requiring them fails the check and names both", async () => {
  const { exitCode, report } = await check(`
flowchart TD
    D["Derivative"] --> NUM["Decimals, ordering, and number lines"]
    I["Integral"] --> NUM
  `);

  assert.notEqual(exitCode, 0);

  const single = invariant(report, 2);
  assert.equal(single.status, "fail");
  assert.equal(single.name, "single-terminal-node");
  assert.deepEqual(new Set(single.failures[0].nodes), new Set(["Derivative", "Integral"]));
});

test("invariant 2: the one Node nothing requires not being the declared Terminal Node names both", async () => {
  const { exitCode, report } = await check(`
flowchart TD
    I["Integral"] --> D["Derivative"]
    D --> NUM["Decimals, ordering, and number lines"]
  `);

  assert.notEqual(exitCode, 0);

  const single = invariant(report, 2);
  assert.equal(single.status, "fail");
  assert.match(single.failures[0].message, /"Integral"/);
  assert.match(single.failures[0].message, /"Derivative"/);
});

test("invariant 2: a declared Terminal Node absent from the graph is named as absent", async () => {
  const { exitCode, report } = await check(`
flowchart TD
    I["Integral"] --> NUM["Decimals, ordering, and number lines"]
  `);

  assert.notEqual(exitCode, 0);

  const single = invariant(report, 2);
  assert.equal(single.status, "fail");
  assert.match(single.failures[0].message, /"Derivative" is not in the graph/);

  // Nothing to walk from, so the two reachability invariants report that rather than
  // inventing a verdict.
  assert.equal(invariant(report, 3).status, "skipped");
  assert.equal(invariant(report, 4).status, "skipped");
});

test("invariant 3: a Node that never reaches a Node with no prerequisites is named", async () => {
  const { exitCode, report } = await check(`
flowchart TD
    D["Derivative"] --> L["Limits"]
    L --> A["Algebra"]
    A --> L
  `);

  assert.notEqual(exitCode, 0);

  const terminates = invariant(report, 3);
  assert.equal(terminates.status, "fail");
  assert.equal(terminates.name, "paths-terminate-at-the-floor");
  assert.deepEqual(new Set(terminates.failures[0].nodes), new Set(["Derivative", "Limits", "Algebra"]));
});

test("invariant 4: a Node unreachable from the Terminal Node is named", async () => {
  const { exitCode, report } = await check(`
flowchart TD
    D["Derivative"] --> NUM["Decimals, ordering, and number lines"]
    LOOSE["Loose end"] --> OTHER["Another loose end"]
    OTHER --> LOOSE
  `);

  assert.notEqual(exitCode, 0);

  const reachable = invariant(report, 4);
  assert.equal(reachable.status, "fail");
  assert.equal(reachable.name, "all-nodes-reachable");
  assert.deepEqual(new Set(reachable.failures[0].nodes), new Set(["Loose end", "Another loose end"]));

  // One Node still has nothing requiring it, and every path from it reaches the Floor:
  // the loose pair is only unreachable.
  assert.equal(invariant(report, 2).status, "pass");
  assert.equal(invariant(report, 3).status, "pass");
});
