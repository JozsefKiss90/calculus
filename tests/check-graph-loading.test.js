// A loader that quietly skips what it does not understand reports a smaller graph than
// the one a human reviewed, and the gate then passes on a graph nobody approved. So every
// way of failing to read the Anchor Graph is a loud failure with the offending line named.

import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  makeFixtureRoot,
  makeFixtureVault,
  makeFixtureVaultFromNote,
  runWiki,
  readReport,
} from "./helpers/vault.js";

test("a vault with no Anchor Graph says so and leaves an error report behind", async () => {
  const { root, vault } = await makeFixtureRoot();

  const { exitCode, stderr } = await runWiki(["check", vault]);
  const report = await readReport(root);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /no Anchor Graph/);
  assert.equal(report.status, "error");
  assert.deepEqual(report.invariants, []);
});

test("a vault directory that does not exist is named", async () => {
  const { vault } = await makeFixtureRoot();
  const missing = join(vault, "nowhere");

  const { exitCode, stderr } = await runWiki(["check", missing]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /cannot read the vault directory/);
  assert.match(stderr, /nowhere/);
});

test("two Anchor Graph Notes in one vault is an error naming both", async () => {
  const { vault } = await makeFixtureVault(`
flowchart TD
    D["Derivative"] --> NUM["Decimals, ordering, and number lines"]
  `);
  await writeFile(join(vault, "Module 2 Anchor Graph.md"), "", "utf8");

  const { exitCode, stderr } = await runWiki(["check", vault]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /more than one Anchor Graph/);
  assert.match(stderr, /Module 1 Anchor Graph\.md/);
  assert.match(stderr, /Module 2 Anchor Graph\.md/);
});

test("an Anchor Graph Note with no mermaid block is an error", async () => {
  const { vault } = await makeFixtureVaultFromNote("## The graph\n\nComing soon.\n");

  const { exitCode, stderr } = await runWiki(["check", vault]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /no fenced mermaid block/);
});

test("a line of the graph that cannot be read is an error naming the line", async () => {
  const { exitCode, stderr } = await runWiki([
    "check",
    (
      await makeFixtureVault(`
flowchart TD
    D["Derivative"] --> NUM["Decimals, ordering, and number lines"]
    D ==> NUM
  `)
    ).vault,
  ]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /Module 1 Anchor Graph\.md:\d+/);
  assert.match(stderr, /D ==> NUM/);
});

test("the same Node named two different things is an error naming both names", async () => {
  const { vault } = await makeFixtureVault(`
flowchart TD
    D["Derivative"] --> NUM["Decimals, ordering, and number lines"]
    D["The derivative"] --> NUM
  `);

  const { exitCode, stderr } = await runWiki(["check", vault]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /named both "Derivative" .* and "The derivative"/);
});

test("two Nodes sharing one name is an error, since one name is one Note", async () => {
  const { vault } = await makeFixtureVault(`
flowchart TD
    D["Derivative"] --> NUM["Decimals, ordering, and number lines"]
    D --> NUM2["Decimals, ordering, and number lines"]
  `);

  const { exitCode, stderr } = await runWiki(["check", vault]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /two Nodes share the name "Decimals, ordering, and number lines"/);
});

test("an Edge declared twice is an error naming both lines, not a quietly smaller graph", async () => {
  const { vault } = await makeFixtureVault(`
flowchart TD
    D["Derivative"] --> NUM["Decimals, ordering, and number lines"]
    D --> NUM
  `);

  const { exitCode, stderr } = await runWiki(["check", vault]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /Derivative requires Decimals, ordering, and number lines is declared twice/);
  assert.match(stderr, /Module 1 Anchor Graph\.md:\d+ and Module 1 Anchor Graph\.md:\d+/);
});

test("commentary on an Edge is not read as part of a Node's name", async () => {
  const { root, vault } = await makeFixtureVault(`
flowchart TD
    D["Derivative"] -->|"For trigonometric derivatives"| T["Trigonometry"]
    T --> NUM["Decimals, ordering, and number lines"]
  `);

  const { exitCode } = await runWiki(["check", vault]);
  const report = await readReport(root);

  assert.equal(exitCode, 0);
  assert.equal(report.graph.nodes, 3);
  assert.equal(report.graph.edges, 2);
});

test("subgraph grouping is not read as a Node", async () => {
  const { root, vault } = await makeFixtureVault(`
flowchart TD
    D["Derivative"] --> A["Algebra"]

    subgraph ALG["Algebra group"]
        A --> NUM["Decimals, ordering, and number lines"]
    end
  `);

  const { exitCode } = await runWiki(["check", vault]);
  const report = await readReport(root);

  assert.equal(exitCode, 0);
  assert.equal(report.graph.nodes, 3);
});
