// Ticket 11: the five computed graded metrics. Each is green, yellow or red against the
// spec's thresholds table, the report states the mandated action for the level it is at, and
// a red metric fails `check` exactly as a broken invariant does.
//
// Every fixture starts as a vault `scaffold` has just filled. A written Note is made healthy
// on every metric by default — a Cross-reference, an Interactive, a fresh `updated` — so each
// test moves one metric and the exit code is that metric's alone.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { checkVault as check, makeScaffoldedVault, runWiki } from "./helpers/vault.js";

// Layer 0 is up to twelve Floor Nodes, Layer 1 is Algebra and Limits, Layer 2 is the Derivative.
const FLOORS = Array.from({ length: 12 }, (_, i) => `Floor ${i + 1}`);
const graph = (floors) => `flowchart TD
    D["Derivative"] --> A["Algebra"]
    D --> L["Limits"]

    subgraph ALG["Algebra"]
${FLOORS.slice(0, floors).map((name, i) => `        A --> F${i + 1}["${name}"]`).join("\n")}
    end

    subgraph LIM["Limits"]
        L --> F1
    end`;

const PATH = {
  Derivative: "calculus/Derivative.md",
  Algebra: "algebra/Algebra.md",
  Limits: "limits/Limits.md",
  ...Object.fromEntries(FLOORS.map((name) => [name, `algebra/${name}.md`])),
};

const INTERACTIVE = `\`\`\`interactive
archetype: function-plot
functions:
  - family: linear
    coefficients: [2, -1]
x-range: [-5, 5]
y-range: [-6, 6]
caption: A straight line.
\`\`\``;

/** A calendar date `days` before today, in local time as `scaffold` writes it. */
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function editNote(vault, name, change) {
  const file = join(vault, PATH[name]);
  await writeFile(file, change(await readFile(file, "utf8")), "utf8");
}

/**
 * Write a Note the way an author would: a status past stub, a summary, and prose under
 * `## The idea`. By default the prose carries a Cross-reference to the Derivative — which no
 * Floor Note is joined to by an Edge — and an Interactive, and `updated` is today.
 */
async function write(vault, name, options = {}) {
  const {
    status = "drafted",
    crossReference = "Derivative",
    interactive = true,
    updated = daysAgo(0),
    prose = "",
  } = options;
  const idea = [
    prose,
    crossReference ? `The same idea reappears in [[${crossReference}]].` : "",
    interactive ? INTERACTIVE : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  await editNote(vault, name, (note) =>
    note
      .replace("status: stub", `status: ${status}`)
      .replace(/^updated: .*$/m, `updated: ${updated}`)
      .replace("## In one sentence\n", `## In one sentence\n\n${name} in one sentence.\n`)
      .replace("## The idea\n", () => `## The idea\n\n${idea}\n`),
  );
}

async function writeAll(vault, names, options) {
  for (const name of names) await write(vault, name, options);
}

const scaffoldedVault = (floors = 12) => makeScaffoldedVault(graph(floors));

/**
 * A vault whose whole of Layer 0 is written, so the stub metric stays green while a
 * percentage metric moves: the first `healthy` Floors as `write` leaves them, the rest with
 * `options` applied.
 */
async function writtenFloors(written, healthy, options) {
  const fixture = await scaffoldedVault(written);
  await writeAll(fixture.vault, FLOORS.slice(0, healthy));
  await writeAll(fixture.vault, FLOORS.slice(healthy, written), options);
  return fixture;
}

function metric(report, id) {
  const found = report.metrics.find((entry) => entry.id === id);
  if (!found) throw new Error(`report has no metric ${id}`);
  return found;
}

/** Assert one metric's level, that every other metric is green, and the exit code that follows. */
function assertLevel({ exitCode, report, stdout }, id, level) {
  assert.equal(metric(report, id).level, level, JSON.stringify(metric(report, id), null, 2));
  for (const other of report.metrics.filter((entry) => entry.id !== id)) {
    assert.equal(other.level, "green", `${other.id} should not move: ${JSON.stringify(other, null, 2)}`);
  }
  assert.equal(exitCode, level === "red" ? 1 : 0, stdout);
  assert.equal(report.status, level === "red" ? "fail" : "pass");
}

test("a freshly scaffolded vault has all six metrics green, with nothing written to measure", async () => {
  const result = await check(await scaffoldedVault());

  assert.equal(result.exitCode, 0, result.stdout);
  assert.deepEqual(
    result.report.metrics.map((entry) => [entry.id, entry.level]),
    [
      ["broken-wikilinks", "green"],
      ["zero-cross-references", "green"],
      ["stale-updated", "green"],
      ["stubs-in-opened-layers", "green"],
      ["archetype-coverage", "green"],
      ["floor-plausibility", "green"],
    ],
  );
  assert.deepEqual(result.report.summary.metrics, { green: 6, yellow: 0, red: 0, skipped: 0 });
});

test("every metric states its thresholds and the mandated action for the level it is at", async () => {
  const fixture = await scaffoldedVault();
  await writeAll(fixture.vault, FLOORS.slice(0, 10));
  await editNote(fixture.vault, "Floor 1", (note) => note.replace("## Worked example\n", "## Worked example\n\nSee [[Nowhere]].\n"));

  const { report, stdout } = await check(fixture);

  for (const entry of report.metrics) {
    assert.deepEqual(Object.keys(entry.bands), ["green", "yellow", "red"]);
    assert.deepEqual(Object.keys(entry.actions), ["green", "yellow", "red"]);
    assert.equal(entry.action, entry.actions[entry.level]);
    assert.ok(entry.action.length > 0);
  }
  const broken = metric(report, "broken-wikilinks");
  assert.equal(broken.level, "yellow");
  assert.deepEqual(broken.bands, { green: "0", yellow: "1–3", red: "4+" });
  assert.match(stdout, /YELLOW +Broken wikilinks: 1/);
  assert.ok(stdout.includes(broken.action), stdout);
});

test("broken wikilinks: 0 is green, 1 and 3 are yellow and exit 0, 4 is red and exits non-zero", async () => {
  for (const [count, level] of [[0, "green"], [1, "yellow"], [3, "yellow"], [4, "red"]]) {
    const fixture = await scaffoldedVault();
    const links = Array.from({ length: count }, (_, i) => `[[Missing ${i + 1}]]`).join(" ");
    await editNote(fixture.vault, "Floor 1", (note) => note.replace("## Common mistakes\n", `## Common mistakes\n\n${links}\n`));

    const result = await check(fixture);

    assertLevel(result, "broken-wikilinks", level);
    assert.equal(metric(result.report, "broken-wikilinks").count, count);
  }
});

test("broken wikilinks are named by Note and target; links in code, and links that resolve, are not broken", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, "Floor 2", (note) =>
    note.replace(
      "## Common mistakes\n",
      [
        "## Common mistakes",
        "",
        "Resolves: [[floor 3]], [[Limits#The idea|limits]], [[algebra/Algebra]], [[Module 1 Anchor Graph]], [[#Worked example]].",
        "Code is not a link: `[[Not a link]]`.",
        "```text",
        "[[Nor is this]]",
        "```",
        "Broken: [[Gone]] and ![[Gone too]].",
        "",
      ].join("\n"),
    ),
  );

  const { report, stdout } = await check(fixture);
  const broken = metric(report, "broken-wikilinks");

  assert.equal(broken.count, 2);
  assert.deepEqual(
    broken.notes.map(({ note, target }) => [note, target]),
    [[PATH["Floor 2"], "Gone"], [PATH["Floor 2"], "Gone too"]],
  );
  assert.match(stdout, /algebra\/Floor 2\.md: \[\[Gone\]\] resolves to no Note/);
});

test("zero Cross-references: below 10% green, 10% and 25% yellow, above 25% red, counted over written Notes", async () => {
  const cases = [
    // [written Notes, of which with no Cross-reference, level]
    [11, 1, "green"],
    [10, 1, "yellow"],
    [4, 1, "yellow"],
    [7, 2, "red"],
  ];
  for (const [written, without, level] of cases) {
    const fixture = await writtenFloors(written, written - without, { crossReference: false });

    const result = await check(fixture);
    const entry = metric(result.report, "zero-cross-references");

    assertLevel(result, "zero-cross-references", level);
    assert.equal(entry.count, without);
    assert.equal(entry.of, written);
  }
});

test("an Edge never counts as a Cross-reference, whether in prose or in a generated block", async () => {
  const fixture = await scaffoldedVault();
  // Floor 1's dependents are Algebra and Limits; Algebra's are the Derivative and its Floors.
  await write(fixture.vault, "Floor 1", { crossReference: "Algebra", prose: "Limits builds on this: [[Limits]]." });
  await write(fixture.vault, "Algebra", { crossReference: "Floor 2", prose: "And [[Derivative]] needs it." });
  await write(fixture.vault, "Floor 3", { crossReference: "Floor 4" });
  assert.equal((await runWiki(["generate", fixture.vault])).exitCode, 0);

  const { report } = await check(fixture);
  const entry = metric(report, "zero-cross-references");

  assert.deepEqual(entry.notes.map(({ note }) => note), [PATH.Algebra, PATH["Floor 1"]]);
  // Floor 3 → Floor 4 is the only Cross-reference; the Edges are the graph's own and counted apart.
  assert.equal(entry.crossReferences, 1);
  assert.equal(entry.edges, 15);
});

test("a Cross-reference counts for the Note it points at as well as the Note it is written in", async () => {
  const fixture = await scaffoldedVault();
  await write(fixture.vault, "Floor 1", { crossReference: "Floor 2" });
  await write(fixture.vault, "Floor 2", { crossReference: false });

  const { report } = await check(fixture);

  assert.equal(metric(report, "zero-cross-references").count, 0);
});

test("stale updated: a drafted Note last updated more than 30 days ago is stale, at the spec's boundaries", async () => {
  const cases = [
    // [written Notes, of which stale, level]
    [11, 1, "green"],
    [10, 1, "yellow"],
    [5, 1, "yellow"],
    [4, 1, "red"],
  ];
  for (const [written, stale, level] of cases) {
    const fixture = await writtenFloors(written, written - stale, { updated: daysAgo(31) });

    const result = await check(fixture);
    const entry = metric(result.report, "stale-updated");

    assertLevel(result, "stale-updated", level);
    assert.equal(entry.count, stale);
    assert.equal(entry.of, written);
  }
});

test("stale updated: 30 days is not stale, a reviewed Note is never stale, and a stub is not counted", async () => {
  const fixture = await scaffoldedVault();
  await write(fixture.vault, "Floor 1", { updated: daysAgo(30) });
  await write(fixture.vault, "Floor 2", { status: "reviewed", updated: daysAgo(400) });
  await editNote(fixture.vault, "Floor 3", (note) => note.replace(/^updated: .*$/m, `updated: ${daysAgo(400)}`));

  const { report } = await check(fixture);
  const entry = metric(report, "stale-updated");

  assert.equal(entry.count, 0);
  assert.equal(entry.of, 2);
});

test("stubs in an opened Layer: 0 green, 1 and 3 yellow, 4 red", async () => {
  for (const [drafted, level] of [[12, "green"], [11, "yellow"], [9, "yellow"], [8, "red"]]) {
    const fixture = await scaffoldedVault();
    await writeAll(fixture.vault, FLOORS.slice(0, drafted));

    const result = await check(fixture);

    assertLevel(result, "stubs-in-opened-layers", level);
    assert.equal(metric(result.report, "stubs-in-opened-layers").count, 12 - drafted);
  }
});

test("a Layer opens when a Note in its computed Layer is written, and only that Layer's stubs count", async () => {
  const fixture = await scaffoldedVault();
  // The Derivative alone opens Layer 2. Its prerequisites are stubs in Layers that are not open.
  await write(fixture.vault, "Derivative", { crossReference: false });
  await write(fixture.vault, "Limits", { crossReference: false });

  const { report } = await check(fixture);
  const entry = metric(report, "stubs-in-opened-layers");

  assert.deepEqual(entry.openedLayers, [1, 2]);
  assert.deepEqual(entry.notes, [{ note: PATH.Algebra, layer: 1, message: `${PATH.Algebra}: is a stub in Layer 1, which is open` }]);
});

test("Archetype coverage: below 20% green, 20% and 40% yellow, above 40% red, counted over written Notes", async () => {
  const cases = [
    // [written Notes, of which with no Interactive, level]
    [11, 2, "green"],
    [10, 2, "yellow"],
    [5, 2, "yellow"],
    [7, 3, "red"],
  ];
  for (const [written, without, level] of cases) {
    const fixture = await writtenFloors(written, written - without, { interactive: false });

    const result = await check(fixture);
    const entry = metric(result.report, "archetype-coverage");

    assertLevel(result, "archetype-coverage", level);
    assert.equal(entry.count, without);
    assert.equal(entry.of, written);
  }
});

test("Archetype coverage counts an interactive block without validating it", async () => {
  const fixture = await scaffoldedVault();
  await write(fixture.vault, "Floor 1", { interactive: false, prose: "```interactive\narchetype: no-such-archetype\n```" });

  const { report } = await check(fixture);

  assert.equal(report.invariants.find((entry) => entry.id === 9).status, "fail");
  assert.equal(metric(report, "archetype-coverage").count, 0);
});

test("a yellow metric is in the human summary and the closing line, and the check still passes", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, "Floor 1", (note) => note.replace("## Common mistakes\n", "## Common mistakes\n\n[[Gone]]\n"));

  const { exitCode, stdout } = await check(fixture);

  assert.equal(exitCode, 0);
  assert.match(stdout, /check passed: 12 of 12 invariants hold; metrics 5 green, 1 yellow, 0 red/);
});

test("a red metric fails the check on its own, and the closing line says which", async () => {
  const fixture = await scaffoldedVault();
  const links = "[[A]] [[B]] [[C]] [[D]]";
  await editNote(fixture.vault, "Floor 1", (note) => note.replace("## Common mistakes\n", `## Common mistakes\n\n${links}\n`));

  const { exitCode, report, stdout } = await check(fixture);

  assert.equal(exitCode, 1);
  assert.equal(report.summary.invariantsFailed, 0);
  assert.match(stdout, /RED +Broken wikilinks: 4/);
  assert.match(stdout, /check failed: 12 of 12 invariants hold; metrics 5 green, 0 yellow, 1 red: Broken wikilinks/);
});
