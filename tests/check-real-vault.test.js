// The regression target for the frozen Anchor Graph. These numbers were verified by hand
// once, before any Note existed, and the graph does not change again without a human
// deciding it should: 61 Nodes, 97 Edges, acyclic, Derivative the one Node nothing
// requires, 61 of 61 reachable, 9 Floor Nodes. They live here rather than in the vault,
// because a count written into content is a count that drifts (ADR-0003). Since 05 the
// scaffolded Notes are held to it too: 61 concept Notes beside two reference Notes — the
// Anchor Graph Note and, since 07, wiki/Conventions.md — and, since 14, one source Note;
// and every invariant from 1 to 12 that exists so far passes.
//
// This is the one test that does not use a fixture vault, because the frozen graph is the
// thing under test. It writes the repo's own .wiki-health/report.json, which is gitignored.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { runWiki, readReport } from "./helpers/vault.js";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const VAULT = fileURLToPath(new URL("../wiki", import.meta.url));

test("check on the real vault passes and reports the frozen graph's shape", async () => {
  const { exitCode, stdout } = await runWiki(["check", VAULT]);
  const report = await readReport(REPO_ROOT);

  assert.equal(exitCode, 0);
  assert.equal(report.status, "pass");
  assert.deepEqual(report.graph, {
    source: "anchor",
    note: "Module 1 Anchor Graph.md",
    nodes: 61,
    edges: 97,
    declaredTerminalNode: "Derivative",
    nodesWithNoDependents: ["Derivative"],
    floorNodes: 9,
    reachableNodes: 61,
  });
  assert.deepEqual(report.notes, { notes: 64, conceptNotes: 61 });
  assert.deepEqual(
    report.invariants.map((entry) => entry.status),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(() => "pass"),
  );

  assert.match(stdout, /61 Nodes, 97 Edges, 9 Floor Nodes/);
  assert.match(stdout, /61 of 61 Nodes reachable/);
  assert.match(stdout, /12 of 12 invariants hold/);
});
