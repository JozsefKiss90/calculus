// Ticket 12: Floor plausibility, the one row of the thresholds table that is not computed.
// `check` lists every Floor Note, a human records a verdict for each in
// wiki/observability/Floor Plausibility.md, and the flagged count grades 0 / 1 / 2+. An
// unjudged Floor Note is never plausible, and a judgement whose Note has gained a
// prerequisite is stale.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { anchorNoteContents, checkVault as check, makeScaffoldedVault } from "./helpers/vault.js";

const GRAPH = `flowchart TD
    D["Derivative"] --> A["Algebra"]

    subgraph ALG["Algebra"]
        A --> F1["Floor 1"]
        A --> F2["Floor 2"]
        A --> F3["Floor 3"]
    end`;

// Floor 1 now requires Floor 2, in the Anchor Graph and in its Note alike.
const GRAPH_WITHOUT_FLOOR_1 = `${GRAPH}

    F1 --> F2`;

const PATH = {
  Derivative: "calculus/Derivative.md",
  Algebra: "algebra/Algebra.md",
  "Floor 1": "algebra/Floor 1.md",
  "Floor 2": "algebra/Floor 2.md",
  "Floor 3": "algebra/Floor 3.md",
};
const FLOORS = [PATH["Floor 1"], PATH["Floor 2"], PATH["Floor 3"]];

const JUDGEMENTS = join("observability", "Floor Plausibility.md");

/** Record judgements the way a human would: rows of the table, under some prose. */
async function judge(vault, rows) {
  await mkdir(join(vault, "observability"), { recursive: true });
  const table = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  await writeFile(
    join(vault, JUDGEMENTS),
    `# Floor Plausibility\n\nJudged by hand.\n\n| Note | Verdict | Reason |\n|---|---|---|\n${table}\n`,
    "utf8",
  );
}

function floorPlausibility(report) {
  const found = report.metrics.find((entry) => entry.id === "floor-plausibility");
  if (!found) throw new Error("report has no floor-plausibility metric");
  return found;
}

const verdicts = (metric) => metric.floorNotes.map(({ note, verdict }) => [note, verdict]);

test("check lists every Note with no prerequisites for judgement, all unjudged when nothing is recorded", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);

  const { exitCode, report, stdout } = await check(fixture);
  const metric = floorPlausibility(report);

  assert.equal(exitCode, 0, stdout);
  assert.equal(metric.level, "green");
  assert.deepEqual(verdicts(metric), FLOORS.map((note) => [note, "unjudged"]));
  assert.deepEqual(metric.judged, { floorNotes: 3, plausible: 0, flagged: 0, unjudged: 3 });
  assert.deepEqual(metric.unjudged.map(({ note }) => note), FLOORS);
  assert.match(stdout, /GREEN +Floor plausibility: Floor Notes flagged above 8th grade: 0/);
  assert.match(stdout, /3 Floor Notes: 0 plausible, 0 flagged, 3 unjudged/);
  for (const note of FLOORS) {
    assert.ok(stdout.includes(`${note}: has no recorded judgement`), stdout);
  }
});

test("the flagged count grades 0 green, 1 yellow and exits 0, 2 red and exits non-zero", async () => {
  for (const [flagged, level] of [[0, "green"], [1, "yellow"], [2, "red"], [3, "red"]]) {
    const fixture = await makeScaffoldedVault(GRAPH);
    await judge(
      fixture.vault,
      ["Floor 1", "Floor 2", "Floor 3"].map((name, i) =>
        i < flagged ? [`[[${name}]]`, "flagged", "Needs the quadratic formula."] : [`[[${name}]]`, "plausible", ""],
      ),
    );

    const { exitCode, report, stdout } = await check(fixture);
    const metric = floorPlausibility(report);

    assert.equal(metric.level, level, JSON.stringify(metric, null, 2));
    assert.equal(metric.count, flagged);
    assert.deepEqual(metric.bands, { green: "0", yellow: "1", red: "2+" });
    assert.equal(metric.action, metric.actions[level]);
    assert.equal(exitCode, level === "red" ? 1 : 0, stdout);
    assert.equal(report.status, level === "red" ? "fail" : "pass");
    assert.equal(report.summary.invariantsFailed, 0);
    for (const other of report.metrics.filter((entry) => entry !== metric)) assert.equal(other.level, "green", other.id);
    if (level !== "green") {
      assert.ok(stdout.includes(metric.action), stdout);
      assert.ok(stdout.includes(`${PATH["Floor 1"]}: flagged above 8th grade: Needs the quadratic formula.`), stdout);
    }
  }
});

test("a flagged Note is reported with its reason in the report", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  await judge(fixture.vault, [["[[Floor 2]]", "flagged", "Uses radians \\| degrees, which is Year 10."]]);

  const { report } = await check(fixture);
  const metric = floorPlausibility(report);

  assert.deepEqual(metric.notes.map(({ note, reason }) => [note, reason]), [
    [PATH["Floor 2"], "Uses radians | degrees, which is Year 10."],
  ]);
  assert.deepEqual(metric.floorNotes[1], {
    note: PATH["Floor 2"],
    verdict: "flagged",
    reason: "Uses radians | degrees, which is Year 10.",
  });
});

test("an unjudged Floor Note is reported as unjudged and never counted as plausible", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  await judge(fixture.vault, [["[[floor 1]]", "plausible", ""]]);

  const { report } = await check(fixture);
  const metric = floorPlausibility(report);

  assert.deepEqual(verdicts(metric), [
    [PATH["Floor 1"], "plausible"],
    [PATH["Floor 2"], "unjudged"],
    [PATH["Floor 3"], "unjudged"],
  ]);
  assert.deepEqual(metric.judged, { floorNotes: 3, plausible: 1, flagged: 0, unjudged: 2 });
  assert.deepEqual(metric.unjudged.map(({ note }) => note), [PATH["Floor 2"], PATH["Floor 3"]]);
});

test("a judgement whose Note no longer has an empty requires is stale and counts for nothing", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  await writeFile(fixture.anchorNote, anchorNoteContents(GRAPH_WITHOUT_FLOOR_1), "utf8");
  const floor1 = join(fixture.vault, PATH["Floor 1"]);
  await writeFile(floor1, (await readFile(floor1, "utf8")).replace("requires: []", 'requires:\n  - "[[Floor 2]]"'), "utf8");
  await judge(fixture.vault, [
    ["[[Floor 1]]", "flagged", "Was flagged before it gained a prerequisite."],
    ["[[Algebra]]", "flagged", "Never was a Floor Note."],
    ["[[Deleted Note]]", "plausible", ""],
    ["[[Floor 2]]", "plausible", ""],
  ]);

  const { exitCode, report, stdout } = await check(fixture);
  const metric = floorPlausibility(report);

  assert.equal(report.summary.invariantsFailed, 0, stdout);
  assert.equal(exitCode, 0, stdout);
  assert.equal(metric.level, "green");
  assert.equal(metric.count, 0);
  assert.deepEqual(verdicts(metric), [
    [PATH["Floor 2"], "plausible"],
    [PATH["Floor 3"], "unjudged"],
  ]);
  assert.deepEqual(
    metric.stale.map(({ line, message }) => [line, message]),
    [
      [7, `observability/Floor Plausibility.md line 7: ${PATH["Floor 1"]} has a non-empty requires, so it is not a Floor Note and its judgement counts for nothing`],
      [8, `observability/Floor Plausibility.md line 8: ${PATH.Algebra} has a non-empty requires, so it is not a Floor Note and its judgement counts for nothing`],
      [9, "observability/Floor Plausibility.md line 9: [[Deleted Note]] names no concept Note"],
    ],
  );
  for (const { message } of metric.stale) assert.ok(stdout.includes(message), stdout);
});

test("nothing infers a judgement: a Floor Note's content never makes it plausible or flagged", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  const floor1 = join(fixture.vault, PATH["Floor 1"]);
  await writeFile(
    floor1,
    (await readFile(floor1, "utf8"))
      .replace("status: stub", "status: drafted")
      .replace("## In one sentence\n", "## In one sentence\n\nThe derivative of $x^2$ is $2x$, by the limit of a difference quotient.\n"),
    "utf8",
  );

  const { report } = await check(fixture);

  assert.equal(floorPlausibility(report).floorNotes[0].verdict, "unjudged");
  assert.equal(floorPlausibility(report).count, 0);
});

test("a judgements file check cannot read in full is refused, and nothing is graded", async () => {
  const cases = [
    [[["[[Floor 1]]", "flagged", ""]], /line 5: \[\[Floor 1\]\] is flagged with no Reason/],
    [[["[[Floor 1]]", "maybe", ""]], /line 5: the Verdict "maybe" is not plausible or flagged/],
    [[["Floor 1", "plausible", ""]], /line 5: the Note "Floor 1" is not a single wikilink/],
    [[["[[Floor 1]]", "plausible"]], /line 5 has 2 cells, not Note, Verdict and Reason/],
    [
      [["[[Floor 1]]", "plausible", ""], ["[[floor 1]]", "flagged", "Changed my mind."]],
      /line 6: \[\[floor 1\]\] is judged twice, here and on line 5/,
    ],
  ];
  for (const [rows, message] of cases) {
    const fixture = await makeScaffoldedVault(GRAPH);
    await judge(fixture.vault, rows);
    // judge() writes its rows from line 7; these cases need them from line 5.
    const file = join(fixture.vault, JUDGEMENTS);
    await writeFile(file, (await readFile(file, "utf8")).replace("Judged by hand.\n\n", ""), "utf8");

    const { exitCode, report, stderr } = await check(fixture);

    assert.equal(exitCode, 2, stderr);
    assert.equal(report.status, "error");
    assert.match(stderr, /observability\/Floor Plausibility\.md cannot be used: /);
    assert.match(stderr, message);
  }
});

test("a judgements file with no Note | Verdict | Reason table is refused", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  await mkdir(join(fixture.vault, "observability"), { recursive: true });
  await writeFile(join(fixture.vault, JUDGEMENTS), "# Floor Plausibility\n\n- [[Floor 1]]: plausible\n", "utf8");

  const { exitCode, stderr } = await check(fixture);

  assert.equal(exitCode, 2);
  assert.match(stderr, /it has no table with the columns Note, Verdict and Reason/);
});

test("the judgements file is not a Note, and its wikilinks are not graded as the Wiki's", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  await judge(fixture.vault, [["[[Deleted Note]]", "plausible", ""]]);

  const { report } = await check(fixture);

  assert.equal(report.notes.notes, 6);
  assert.equal(report.metrics.find((entry) => entry.id === "broken-wikilinks").count, 0);
});
