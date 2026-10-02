// Ticket 08: docs/archetype-catalogue.md is the closed set of Archetypes every Interactive
// instantiates (ADR-0004). This holds what the validator and both agent contracts rely on:
// the spec's thirteen Archetypes first and any the Archetype Builder adds after them, none a
// placeholder, a one-liner short enough for a Context Pack, no rendering library or
// expression language named anywhere, and a worked example from a real Note for each.
//
// Like conventions.test.js, it reads the real file, because the file is the thing under test.
// Since ticket 09 it reads the schemas through the validator's own parser rather than a copy
// of it, so what is tested here is exactly what `check` validates against; that parser refuses
// a catalogue that breaks its own rules (a type not defined, a default outside its range, a
// Range naming a parameter that is not there), so loading it at all is most of the test. That
// import is the one place a test reaches into scripts/lib/, and it is fed only the real file
// or the real file with one change made: broken, or with an Archetype appended the way the
// Archetype Builder appends one. Every example is validated in full by
// tests/check-interactives.test.js, through the CLI.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, join } from "node:path";
import { CatalogueError, parseCatalogue } from "../scripts/lib/archetype-catalogue.js";

const CATALOGUE = fileURLToPath(new URL("../docs/archetype-catalogue.md", import.meta.url));
const VAULT = fileURLToPath(new URL("../wiki/", import.meta.url));

/** The spec's initial catalogue, in its order. */
const ARCHETYPES = [
  "function-plot",
  "secant-to-tangent",
  "unit-circle",
  "right-triangle",
  "limit-table",
  "number-line",
  "transformation-explorer",
  "slope-triangle",
  "piecewise-explorer",
  "expression-stepper",
  "ratio-scaler",
  "grid-plotter",
  "squeeze-visual",
];

/** Short enough to paste into a Context Pack unmodified, one line per Archetype. */
const MAX_ONE_LINER = 120;

/** Rendering libraries, frameworks and expression languages the content layer never names. */
const FORBIDDEN = [
  /\bJSXGraph\b/i, /\bMafs\b/i, /\bReact\b/, /\bD3(\.js)?\b/, /\bPlotly\b/i, /\bDesmos\b/i,
  /\bGeoGebra\b/i, /\bChart\.js\b/i, /\bVue\b/, /\bSvelte\b/i, /\bAngular\b/, /\bKaTeX\b/i,
  /\bMathJax\b/i, /\bmath\.?js\b/i, /\bJavaScript\b/i, /\bTypeScript\b/i, /\bJSX\b/, /\bSVG\b/,
  /\bcanvas\b/i, /\bWebGL\b/i, /=>/, /\bMath\.\w/, /\bfunction\s*\(/, /\breturn\b/,
];

async function catalogue() {
  return (await readFile(CATALOGUE, "utf8")).replace(/\r\n/g, "\n");
}

async function parsed() {
  const text = await catalogue();
  return { text, lines: text.split("\n"), ...parseCatalogue(text) };
}

/** The lines from `heading` to the next heading of the same or higher level. */
function section(lines, heading) {
  const start = lines.indexOf(heading);
  assert.notEqual(start, -1, `no "${heading}" section`);
  const level = heading.match(/^#+/)[0].length;
  const end = lines.findIndex((line, i) => i > start && new RegExp(`^#{1,${level}} `).test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end);
}

/** Each Archetype's section, by name, for the examples under it. */
function archetypeSections(lines) {
  const found = new Map();
  let current = null;
  for (const line of section(lines, "## Archetypes")) {
    const match = /^### `([a-z-]+)`$/.exec(line);
    if (match) found.set(match[1], (current = []));
    else current?.push(line);
  }
  return found;
}

test("the catalogue opens with the thirteen Archetypes of the spec, in its order", async () => {
  const { archetypes } = await parsed();
  // Any after them were added by the Archetype Builder and reviewed by the author.
  assert.deepEqual([...archetypes.keys()].slice(0, ARCHETYPES.length), ARCHETYPES);
});

test("an Archetype appended in the catalogue's shape is read after every other", async () => {
  const text = await catalogue();
  const added = `
### \`appended-sample\`

**One-liner:** Feeds an input through one or two function machines in turn and shows the output of each.

**Serves:** inputs and outputs, composition.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| \`machines\` | \`list of function\` | yes | — | \`[1, 2] items\` | The machines, applied in this order. |
| \`input\` | \`number\` | no | \`2\` | \`[-1000, 1000]\` | The number fed in first. |
| \`caption\` | \`text\` | no | \`none\` | — | One line saying what to notice. |
`;
  const { archetypes } = parseCatalogue(`${text.trimEnd()}\n${added}`);
  // The real catalogue may already hold Archetypes the Builder added, so only the end is fixed.
  assert.equal([...archetypes.keys()].at(-1), "appended-sample");
  assert.deepEqual([...archetypes.get("appended-sample").parameters.keys()], ["machines", "input", "caption"]);
});

test("the composite types are defined, and the function type fixes each family's coefficient count", async () => {
  const { composites, lines } = await parsed();
  assert.deepEqual([...composites.keys()], ["function", "piece", "step", "quantity"]);

  const [count] = composites.get("function").counts;
  assert.equal(count.selector, "family");
  assert.equal(count.counted, "coefficients");
  assert.deepEqual(Object.fromEntries(count.byValue), {
    linear: [2, 2],
    quadratic: [3, 3],
    polynomial: [1, 6],
    rational: [1, 6],
    absolute: [3, 3],
    "square-root": [3, 3],
    sine: [4, 4],
    cosine: [4, 4],
    tangent: [4, 4],
  });
  // Each family says what its coefficients mean, as mathematics.
  for (const family of count.byValue.keys()) {
    const row = lines.find((l) => l.startsWith(`| \`${family}\` |`));
    assert.match(row, /\$.+\$/, `${family}: its meaning is not written as mathematics`);
  }
});

test("every Archetype has a complete parameter schema", async () => {
  const { archetypes } = await parsed();
  for (const [name, { parameters }] of archetypes) {
    assert.ok(parameters.size >= 3, `${name}: fewer than three parameters reads as a placeholder`);
  }
});

test("a catalogue that breaks its own rules is refused, naming where", () => {
  return catalogue().then((text) => {
    const broken = [
      // A default outside its own range: h excludes 0.
      ["| `h` | `number` | no | `1` |", "| `h` | `number` | no | `0` |", /secant-to-tangent, h: the default 0 is refused/],
      // A type ## Types does not define.
      ["| `angle` | `number` | yes |", "| `angle` | `angel` | yes |", /unit-circle, angle: the type "angel" is not defined/],
      // A Range naming a parameter that is not there.
      ["`within x-range`", "`within x-rang`", /secant-to-tangent, at: its Range names x-rang/],
      // A required parameter with a default.
      ["| `limit` | `enum(sin-h-over-h, cos-h-minus-1-over-h)` | yes | — |", "| `limit` | `enum(sin-h-over-h, cos-h-minus-1-over-h)` | yes | `sin-h-over-h` |", /squeeze-visual, limit: a required parameter has the default/],
      // A range term outside the grammar.
      ["`[0, 6]`", "`from 0 to 6`", /range term "from 0 to 6"/],
      // A heading that names no Archetype, which would otherwise be skipped.
      ["### `squeeze-visual`", "### squeeze-visual", /the heading "### squeeze-visual"/],
      // A family with no coefficient count.
      ["| `linear` | 2 |", "| `linear` | two |", /type function, linear: Coefficients is "two"/],
    ];
    for (const [from, to, reason] of broken) {
      assert.ok(text.includes(from), `the catalogue no longer holds ${from}`);
      assert.throws(() => parseCatalogue(text.replace(from, to)), (error) => error instanceof CatalogueError && reason.test(error.message));
    }
  });
});

test("every Archetype carries a one-liner short enough for a Context Pack, and what it serves", async () => {
  const { archetypes } = await parsed();
  for (const [name, { oneLiner, serves }] of archetypes) {
    assert.ok(oneLiner.length <= MAX_ONE_LINER, `${name}: one-liner is ${oneLiner.length} characters, over ${MAX_ONE_LINER}`);
    assert.match(oneLiner, /^[A-Z][^.]*\.$/, `${name}: one-liner is not a single sentence`);
    assert.ok(serves.length > 0, `${name}: does not say what it serves`);
  }
});

test("no rendering library, framework or expression language is named anywhere", async () => {
  const { text } = await parsed();
  // Link targets are paths, not prose: ADR-0006's filename names the LaTeX subset's parser.
  const prose = text.replace(/\]\([^)]*\)/g, "]");
  for (const pattern of FORBIDDEN) {
    const hit = pattern.exec(prose);
    assert.equal(hit, null, `names "${hit?.[0]}": ${prose.slice(Math.max(0, (hit?.index ?? 0) - 40), (hit?.index ?? 0) + 40)}`);
  }
});

test("every Archetype has a worked example drawn from a real Note, naming that Archetype", async () => {
  const { lines } = await parsed();
  const notes = new Set();
  for (const domain of await readdir(VAULT, { withFileTypes: true })) {
    if (!domain.isDirectory() || domain.name.startsWith(".")) continue;
    for (const file of await readdir(join(VAULT, domain.name))) {
      if (file.endsWith(".md")) notes.add(basename(file, ".md"));
    }
  }

  for (const [name, body] of archetypeSections(lines)) {
    const examples = [];
    for (const [i, line] of body.entries()) {
      const heading = /^\*\*Example\*\* — \[\[([^\]]+)\]\]: \S/.exec(line);
      if (!heading) continue;
      // The block must come before the next Example, or two headings would share one block.
      const next = body.findIndex((l, j) => j > i && l.startsWith("**Example**"));
      const open = body.indexOf("```interactive", i);
      const close = body.indexOf("```", open + 1);
      assert.ok(open > i && (next === -1 || open < next) && close > open, `${name}: example from ${heading[1]} has no interactive block`);
      examples.push({ note: heading[1], first: body[open + 1] });
    }
    assert.ok(examples.length >= 1, `${name}: no worked example`);

    for (const { note, first } of examples) {
      assert.ok(notes.has(note), `${name}, example from ${note}: no such Note in the Wiki`);
      assert.equal(first, `archetype: ${name}`, `${name}, example from ${note}: does not open by naming its own archetype`);
    }
  }
});

test("the catalogue records that it is a closed set, extended only through the Archetype Builder", async () => {
  const { lines } = await parsed();
  const closed = section(lines, "## A closed set").join("\n");
  assert.match(closed, /closed set/);
  assert.match(closed, /Archetype Builder/);
});
