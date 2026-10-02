// Ticket 09: `check` holds every `interactive` block to invariant 9 — it names an Archetype
// in docs/archetype-catalogue.md and validates against that Archetype's parameter schema, so
// a typo fails the build instead of reaching a learner as a blank box (ADR-0004). Every
// fixture starts as a vault `scaffold` has just filled, and each puts a block into a Note's
// prose the way the Interactive Author would.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { checkVault as check, invariant, makeScaffoldedVault } from "./helpers/vault.js";

const GRAPH = `flowchart TD
    D["Derivative"] --> L["Limits"]

    subgraph LIM["Limits"]
        L --> C["Continuity"]
    end`;

const LIMITS = "limits/Limits.md";
const CONTINUITY = "limits/Continuity.md";

const CATALOGUE = fileURLToPath(new URL("../docs/archetype-catalogue.md", import.meta.url));

const scaffoldedVault = () => makeScaffoldedVault(GRAPH);

/** Write prose under a Note's `## The idea`, the way an author fills a section. */
async function writeIdea(vault, path, prose) {
  const file = join(vault, path);
  const note = await readFile(file, "utf8");
  assert.ok(note.includes("## The idea\n"), `${path} has no ## The idea`);
  await writeFile(file, note.replace("## The idea\n", () => `## The idea\n\n${prose}\n`), "utf8");
}

const block = (yaml) => `\`\`\`interactive\n${yaml.trim()}\n\`\`\``;

/** The 1-based line of the first line of the file containing the given text. */
async function lineOf(vault, path, text) {
  const lines = (await readFile(join(vault, path), "utf8")).split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(text));
  assert.notEqual(index, -1, `${text} is not in ${path}`);
  return index + 1;
}

/** Invariant 9's failures, as [problem, parameter] pairs. */
const problems = (report) => invariant(report, 9).failures.map((f) => [f.problem, f.parameter]);

/** Check a vault whose Limits Note holds the one block given, and return the verdict. */
async function checkBlock(yaml) {
  const fixture = await scaffoldedVault();
  await writeIdea(fixture.vault, LIMITS, `Look at this.\n\n${block(yaml)}`);
  return { fixture, ...(await check(fixture)) };
}

test("a block naming an Archetype outside the catalogue fails, naming the Note, the line and the name", async () => {
  const { fixture, exitCode, stdout, report } = await checkBlock(`
archetype: function-plott
functions:
  - family: linear
    coefficients: [2, -1]
`);

  assert.equal(exitCode, 1);
  assert.equal(report.status, "fail");
  const [failure, ...rest] = invariant(report, 9).failures;
  assert.deepEqual(rest, []);
  assert.equal(failure.problem, "unknown-archetype");
  assert.equal(failure.note, LIMITS);
  assert.equal(failure.line, await lineOf(fixture.vault, LIMITS, "archetype: function-plott"));
  assert.equal(failure.block, await lineOf(fixture.vault, LIMITS, "```interactive"));
  assert.equal(failure.archetype, "function-plott");
  assert.match(failure.message, /function-plott/);
  assert.match(failure.message, /did you mean function-plot\?/);
  assert.match(stdout, /FAIL\s+9\s+Every interactive block names a known Archetype/);
  assert.match(stdout, /limits\/Limits\.md:\d+: .*"function-plott"/);
});

test("a block that names no Archetype at all fails", async () => {
  const { exitCode, report } = await checkBlock(`
angle: 60
`);
  assert.equal(exitCode, 1);
  assert.deepEqual(problems(report), [["missing-archetype", undefined]]);
});

test("a missing required parameter fails and is named", async () => {
  const { exitCode, report } = await checkBlock(`
archetype: unit-circle
show-arc: true
`);
  assert.equal(exitCode, 1);
  assert.deepEqual(problems(report), [["missing-parameter", "angle"]]);
  assert.match(invariant(report, 9).failures[0].message, /unit-circle needs angle/);
});

test("an unknown parameter fails and is named, with the nearest real one suggested", async () => {
  const { exitCode, report } = await checkBlock(`
archetype: unit-circle
angle: 60
show-arcs: true
`);
  assert.equal(exitCode, 1);
  assert.deepEqual(problems(report), [["unknown-parameter", "show-arcs"]]);
  assert.match(invariant(report, 9).failures[0].message, /did you mean show-arc\?/);
});

test("a wrong type fails and is named, and a quoted number is text, not a number", async () => {
  const { exitCode, report } = await checkBlock(`
archetype: unit-circle
angle: '60'
show-arc: yes
decimals: 2.5
`);
  assert.equal(exitCode, 1);
  assert.deepEqual(problems(report), [
    ["wrong-type", "angle"],
    ["wrong-type", "show-arc"],
    ["wrong-type", "decimals"],
  ]);
  const [angle, showArc, decimals] = invariant(report, 9).failures.map((f) => f.message);
  assert.match(angle, /angle must be a number/);
  assert.match(showArc, /show-arc must be true or false/);
  assert.match(decimals, /decimals must be an integer/);
});

test("an out-of-range value fails and is named, whether a bound, an exclusion or an item count", async () => {
  const { exitCode, report } = await checkBlock(`
archetype: secant-to-tangent
function:
  family: quadratic
  coefficients: [1, 0, 0]
at: 1
h: 0
smallest-h: 5
`);
  assert.equal(exitCode, 1);
  assert.deepEqual(problems(report), [
    ["out-of-range", "h"],
    ["out-of-range", "smallest-h"],
  ]);
  const [h, smallest] = invariant(report, 9).failures.map((f) => f.message);
  assert.match(h, /h cannot be 0/);
  assert.match(smallest, /smallest-h is 5, outside \[0\.000001, 1\]/);
});

test("the four kinds of mistake in one block are each reported, each under its own name", async () => {
  const { report } = await checkBlock(`
archetype: right-triangle
hypotenuse: 0
drag: sideways
colour: red
`);
  assert.deepEqual(problems(report), [
    ["out-of-range", "hypotenuse"],
    ["wrong-type", "drag"],
    ["unknown-parameter", "colour"],
    ["missing-parameter", "angle"],
  ]);
});

test("a mistake inside a composite value is named by its path", async () => {
  const { report } = await checkBlock(`
archetype: function-plot
functions:
  - family: linear
    coefficients: [2, -1]
  - family: cubic
    coefficients: [1, 0, 0, 0]
  - family: quadratic
    coefficients: [1, 0]
  - family: sine
    coefficients: [1, 1, 0, 0]
    denominator: [1]
    label: '\\sin x'
`);
  assert.deepEqual(problems(report), [
    ["wrong-type", "functions[1].family"],
    ["out-of-range", "functions[2].coefficients"],
    ["unmet-condition", "functions[3].denominator"],
  ]);
  const messages = invariant(report, 9).failures.map((f) => f.message);
  assert.match(messages[1], /a quadratic function takes 3 coefficients, and has 2/);
  assert.match(messages[2], /only when family is rational/);
});

test("constraints between parameters hold: within, differs from and needs", async () => {
  const { report } = await checkBlock(`
archetype: slope-triangle
from: [1, 2]
to: [1, 2]
`);
  assert.deepEqual(problems(report), [["out-of-range", "to"]]);

  const within = await checkBlock(`
archetype: secant-to-tangent
function:
  family: linear
  coefficients: [1, 0]
at: 12
`);
  // x-range is left out, so at is held to its default, [-10, 10].
  assert.deepEqual(problems(within.report), [["out-of-range", "at"]]);
  assert.match(invariant(within.report, 9).failures[0].message, /within x-range \[-10, 10\]/);

  const needs = await checkBlock(`
archetype: number-line
centre: 2
`);
  assert.deepEqual(problems(needs.report), [["unmet-condition", "centre"]]);
});

test("a span is written in interval notation, with infinity only at an open end", async () => {
  const valid = await checkBlock(`
archetype: number-line
intervals: ['[-2, 3)', '(1, inf)', '(-inf, 0.5]']
`);
  assert.deepEqual(problems(valid.report), []);

  const { report } = await checkBlock(`
archetype: number-line
intervals:
  - '[1, inf]'
  - '(3, 1)'
  - 1 to 3
`);
  assert.deepEqual(problems(report), [
    ["wrong-type", "intervals[0]"],
    ["wrong-type", "intervals[1]"],
    ["wrong-type", "intervals[2]"],
  ]);
});

test("a latex parameter is mathematics: KaTeX checks it, and a double-quoted backslash is caught", async () => {
  const { report } = await checkBlock(`
archetype: expression-stepper
steps:
  - latex: '\\bbox[red]{x}'
  - latex: "\\frac{1}{2}"
  - latex: 'x'
    because: Because $x$ is \\emph{obvious}.
`);
  assert.deepEqual(problems(report), [
    ["katex-rejects", "steps[0].latex"],
    ["wrong-type", "steps[1].latex"],
    ["wrong-type", "steps[2].because"],
  ]);
  const messages = invariant(report, 9).failures.map((f) => f.message);
  assert.match(messages[0], /Undefined control sequence: \\bbox/);
  assert.match(messages[1], /single-quote/);
  assert.match(messages[2], /no LaTeX/);
});

test("malformed YAML is a failure naming the line and what is wrong, not a crash", async () => {
  const cases = [
    ["archetype: unit-circle\nangle: [60", /never closed/],
    ["archetype: unit-circle\n  angle: 60", /indent/],
    ["archetype: unit-circle\nangle: 60\nangle: 30", /angle is given twice/],
    ["archetype: unit-circle\nangle: 60\ncaption: Look: the arc", /quote/],
    ["archetype: expression-stepper\nsteps:\n  - latex: \"\\sqrt{x}\"\n  - latex: 'x'", /single-quote/],
    ["- archetype: unit-circle", /mapping/],
    // In a flow mapping YAML needs a space after a plain key, so this is one value, not two.
    ["archetype: ratio-scaler\nfirst: {label:time, value: 2}\nsecond: {label: distance, value: 150}", /label:time is one value/],
    ["---\narchetype: unit-circle\nangle: 60", /leave it out/],
    ["", /empty/],
  ];
  for (const [yaml, reason] of cases) {
    const fixture = await scaffoldedVault();
    await writeIdea(fixture.vault, LIMITS, block(yaml));
    const { exitCode, stderr, report } = await check(fixture);

    assert.equal(exitCode, 1, `${yaml}: ${stderr}`);
    assert.equal(stderr, "");
    const failures = invariant(report, 9).failures;
    assert.equal(failures.length, 1, `${yaml}: ${JSON.stringify(failures)}`);
    assert.equal(failures[0].problem, yaml === "" ? "missing-archetype" : "malformed-yaml", yaml);
    assert.match(failures[0].message, reason, yaml);
    assert.equal(typeof failures[0].line, "number");
  }
});

test("a malformed YAML failure names the line inside the block", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(fixture.vault, LIMITS, block("archetype: unit-circle\nangle: 60\nsnap: [special"));

  const { report } = await check(fixture);

  const [failure] = invariant(report, 9).failures;
  assert.equal(failure.line, await lineOf(fixture.vault, LIMITS, "snap: [special"));
});

test("an interactive block that is never closed fails", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(fixture.vault, LIMITS, "```interactive\narchetype: unit-circle\nangle: 60\n");

  const { report } = await check(fixture);

  assert.deepEqual(problems(report).map(([problem]) => problem), ["unclosed-interactive-block"]);
});

test("every worked example in the catalogue passes, which is a valid instance of each of the thirteen Archetypes", async () => {
  const catalogue = (await readFile(CATALOGUE, "utf8")).replace(/\r\n/g, "\n");
  const examples = [...catalogue.matchAll(/^```interactive\n([\s\S]*?)^```$/gm)].map((m) => m[1]);
  const archetypes = new Set(examples.map((yaml) => /^archetype: (\S+)$/m.exec(yaml)[1]));
  assert.equal(archetypes.size, 13);

  const fixture = await scaffoldedVault();
  await writeIdea(fixture.vault, LIMITS, examples.map((yaml) => block(yaml)).join("\n\nAnd another.\n\n"));
  const { exitCode, stdout, report } = await check(fixture);

  assert.deepEqual(invariant(report, 9).failures, []);
  assert.equal(invariant(report, 9).status, "pass");
  assert.equal(exitCode, 0, stdout);
});

test("a valid block reads as text: its dollar-free LaTeX is no Note mathematics, and other code blocks are not validated", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(
    fixture.vault,
    CONTINUITY,
    [
      block(`
archetype: limit-table
function:
  family: rational
  coefficients: [1, 0, -1]
  denominator: [1, -1]
  label: 'f(x) = \\frac{x^2 - 1}{x - 1}'
approach: 1
caption: There is no output at 1 itself, but both columns close in on 2.
`),
      // An example of a block, shown in a longer fence, is not an Interactive.
      "````markdown\n```interactive\narchetype: nonsense\n```\n````",
      "```yaml\narchetype: nonsense\n```",
    ].join("\n\n"),
  );

  const { exitCode, stdout, report } = await check(fixture);

  assert.equal(exitCode, 0, stdout);
  assert.equal(invariant(report, 8).status, "pass");
  assert.equal(invariant(report, 9).status, "pass");
});

test("a tilde fence and a comment are read as YAML reads them", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(
    fixture.vault,
    LIMITS,
    "~~~interactive\n# the special angles\narchetype: unit-circle # the circle\nangle: 45\n\nsnap: special-angles\ncaption: Pythagoras' theorem, f(2), 'the special angles # a comment\n~~~",
  );

  const { report } = await check(fixture);

  assert.equal(invariant(report, 9).status, "pass", JSON.stringify(invariant(report, 9).failures));
});

test("flow mappings and flow lists across lines are YAML too", async () => {
  const { report } = await checkBlock(`
archetype: function-plot
functions: [{family: linear, coefficients: [1, 0]},
  {family: quadratic, coefficients: [1, 0, 0]}]
points:
- [0, 0]
- [1, 1]
`);
  assert.equal(invariant(report, 9).status, "pass", JSON.stringify(invariant(report, 9).failures));
});
