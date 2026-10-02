// Ticket 10: the Interactive Author, run against a Note drafted by hand, writes blocks that
// validate. The run is an agent's, so it cannot happen inside a test; what is kept is its
// input and its output, in tests/fixtures/interactive-author/:
//
//   Coordinates, tables, and plotting.drafted.md   the Note as drafted by hand
//   Coordinates, tables, and plotting.md           the same Note after the agent's run
//
// The output is held to what its contract (.claude/agents/interactive-author.md) promises:
// it holds every invariant `check` computes, invariant 9 included, and it differs from its input only by
// `interactive` blocks and its `updated` date, so the agent touched no prose, no generated
// block, and neither `status` nor `reviewed_by`. Re-run the agent and replace the output when
// the catalogue changes under it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { checkVault, invariant, makeScaffoldedVault, runWiki } from "./helpers/vault.js";

const NOTE = "Coordinates, tables, and plotting";
const FIXTURES = fileURLToPath(new URL("./fixtures/interactive-author/", import.meta.url));

// The Note and every Node that requires it, so its generated blocks are the real ones.
const GRAPH = `flowchart TD
    D["Derivative"] --> F["Functions, slopes, and rates"]
    D --> L["Limits"]
    D --> T["Trigonometry"]

    subgraph FUN["Functions, slopes, and rates"]
        F --> TRANS["Translations, reflections, and stretches"]
        F --> DIFF["Coordinate differences and rise over run"]
        TRANS --> COORD["${NOTE}"]
        DIFF --> COORD
    end

    subgraph LIM["Limits"]
        L --> GRAPH["Numerical tables and graph behaviour"]
        GRAPH --> COORD
    end

    subgraph TRIG["Trigonometry"]
        T --> QUAD["Quadrants, signs, and reference angles"]
        QUAD --> COORD
    end`;

const read = async (file) => (await readFile(join(FIXTURES, file), "utf8")).replace(/\r\n/g, "\n");
const drafted = () => read(`${NOTE}.drafted.md`);
const authored = () => read(`${NOTE}.md`);

const BLOCK = /^```interactive\n[\s\S]*?^```\n\n/gm;
const UPDATED = /^updated: .*$/m;

/** A fixture vault, generated, whose Note is the given text. */
async function vaultHolding(text) {
  const fixture = await makeScaffoldedVault(GRAPH);
  assert.equal((await runWiki(["generate", fixture.vault])).exitCode, 0);
  const path = join(fixture.vault, "functions", `${NOTE}.md`);
  await writeFile(path, text, "utf8");
  return { ...fixture, path };
}

// A lone written Note is the whole of the written population, so the percentage metrics read
// 0% or 100% of one Note; the fixture Note has no Cross-reference, so that metric is red
// either side of the run. What the run is for is the Archetype coverage metric.
const uncovered = (report) => report.metrics.find((metric) => metric.id === "archetype-coverage").notes.map(({ note }) => note);

test("the hand-drafted input is a drafted Note that holds every invariant and has no Interactive", async () => {
  const text = await drafted();
  assert.match(text, /^status: drafted$/m);
  assert.match(text, /^reviewed_by: none$/m);
  assert.doesNotMatch(text, /```interactive/);

  const { stdout, report } = await checkVault(await vaultHolding(text));
  assert.equal(report.summary.invariantsFailed, 0, stdout);
  assert.deepEqual(uncovered(report), [`functions/${NOTE}.md`]);
});

test("the Interactive Author's output holds every invariant, with invariant 9 over its blocks, and covers the Note", async () => {
  const text = await authored();
  assert.ok(text.match(BLOCK)?.length >= 1, "the output holds no interactive block");

  const { stdout, report } = await checkVault(await vaultHolding(text));
  assert.equal(report.summary.invariantsFailed, 0, stdout);
  assert.equal(invariant(report, 9).status, "pass");
  assert.deepEqual(uncovered(report), []);
});

test("the output differs from the drafted Note only by its interactive blocks and its updated date", async () => {
  const [before, after] = [await drafted(), await authored()];
  assert.match(after, /^status: drafted$/m);
  assert.match(after, /^reviewed_by: none$/m);
  assert.equal(after.replace(BLOCK, "").replace(UPDATED, before.match(UPDATED)[0]), before);
});

test("the output's generated blocks are the ones generate writes", async () => {
  const fixture = await vaultHolding(await authored());
  const before = await readFile(fixture.path, "utf8");
  assert.equal((await runWiki(["generate", fixture.vault])).exitCode, 0);
  assert.equal(await readFile(fixture.path, "utf8"), before);
});
