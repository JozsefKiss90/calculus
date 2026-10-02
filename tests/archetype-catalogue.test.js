// Ticket 08: docs/archetype-catalogue.md is the closed set of Archetypes every Interactive
// instantiates (ADR-0004). It is a design deliverable that ships ahead of the validator
// (ticket 09), so this holds what the validator and both agent contracts will rely on: all
// thirteen Archetypes present with no placeholder, every parameter typed with a required
// flag, a default and a range in one machine-readable grammar, every default inside its own
// range, no rendering library or expression language named anywhere, a one-liner short
// enough for a Context Pack, and a worked example from a real Note for each.
//
// Like conventions.test.js, it reads the real file, because the file is the thing under test.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, join } from "node:path";

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

const SCALARS = ["number", "integer", "boolean", "text", "latex", "point", "pair", "interval", "span"];

/** Short enough to paste into a Context Pack unmodified, one line per Archetype. */
const MAX_ONE_LINER = 120;

const COLUMNS = ["Type", "Required", "Default", "Range", "Meaning"];

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

/** The lines from `heading` to the next heading of the same or higher level. */
function section(lines, heading) {
  const start = lines.indexOf(heading);
  assert.notEqual(start, -1, `no "${heading}" section`);
  const level = heading.match(/^#+/)[0].length;
  const end = lines.findIndex((line, i) => i > start && new RegExp(`^#{1,${level}} `).test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end);
}

/** Every `### `name`` (or `#### `name``) subsection of a section, by name. */
function subsections(lines, marker) {
  const found = new Map();
  let current = null;
  for (const line of lines) {
    const match = new RegExp(`^${marker} \`([a-z-]+)\`$`).exec(line);
    if (match) found.set(match[1], (current = []));
    else if (/^#{1,4} /.test(line)) current = null;
    else current?.push(line);
  }
  return found;
}

const cells = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const unquote = (cell) => cell.replace(/^`(.*)`$/, "$1");

/** The first table in `lines`, as rows keyed by its header, with the first column as `name`. */
function table(lines, where) {
  // Only the first table: a composite type's field table may be followed by another.
  const first = lines.findIndex((line) => line.startsWith("|"));
  const after = lines.findIndex((line, i) => i > first && !line.startsWith("|"));
  const rows = first === -1 ? [] : lines.slice(first, after === -1 ? undefined : after);
  assert.ok(rows.length >= 3, `${where}: no table with at least one row`);
  const [header, rule, ...body] = rows;
  assert.match(rule, /^\|(\s*:?-+:?\s*\|)+$/, `${where}: second table row is not a header rule`);
  const names = cells(header);
  return body.map((row) => {
    const values = cells(row);
    assert.equal(values.length, names.length, `${where}: "${row}" has the wrong number of cells`);
    const entry = Object.fromEntries(names.map((n, i) => [n, values[i]]));
    entry.name = unquote(values[0]);
    return entry;
  });
}

/** A type written in the catalogue's type grammar, or a failed assertion naming it. */
function parseType(text, known, where) {
  const list = /^list of (.+)$/.exec(text);
  if (list) return { list: parseType(list[1], known, where) };
  const enumeration = /^enum\(([a-z0-9-]+(?:, [a-z0-9-]+)*)\)$/.exec(text);
  if (enumeration) return { enum: enumeration[1].split(", ") };
  assert.ok(known.includes(text), `${where}: type "${text}" is not defined in ## Types`);
  return { name: text };
}

/** A Range cell: `—`, or terms joined by `; `. */
function parseRange(text, where) {
  const range = { bounds: null, items: null, excluding: [], within: null, differsFrom: null, needs: null, onlyWhen: null };
  if (text === "—") return range;
  const NUMBER = String.raw`-?\d+(?:\.\d+)?`;
  const terms = [
    [new RegExp(`^\\[(${NUMBER}), (${NUMBER})\\] items$`), (m) => (range.items = [Number(m[1]), Number(m[2])])],
    [new RegExp(`^\\[(${NUMBER}), (${NUMBER})\\]$`), (m) => (range.bounds = [Number(m[1]), Number(m[2])])],
    [new RegExp(`^excluding (${NUMBER})$`), (m) => range.excluding.push(Number(m[1]))],
    [/^within ([a-z-]+)$/, (m) => (range.within = m[1])],
    [/^differs from ([a-z-]+)$/, (m) => (range.differsFrom = m[1])],
    [/^needs ([a-z-]+)$/, (m) => (range.needs = m[1])],
    [/^only when ([a-z-]+) is ([a-z0-9-]+)$/, (m) => (range.onlyWhen = { param: m[1], value: m[2] })],
  ];
  for (const term of text.split("; ")) {
    const match = terms.find(([pattern]) => pattern.test(term));
    if (!match) assert.fail(`${where}: range term "${term}" is not in the range grammar`);
    match[1](match[0].exec(term));
  }
  if (range.bounds) assert.ok(range.bounds[0] < range.bounds[1], `${where}: empty range ${text}`);
  if (range.items) assert.ok(range.items[0] <= range.items[1], `${where}: empty item range ${text}`);
  return range;
}

/** A flow literal from a Default cell or an example line: scalar or `[a, b, …]`. */
function literal(text) {
  if (/^\[.*\]$/.test(text)) {
    const inner = text.slice(1, -1).trim();
    // Defaults are flat: a list of points as a default is written `[]` or not at all.
    assert.doesNotMatch(inner, /[[\]]/, `nested default ${text} is not supported`);
    return inner === "" ? [] : inner.split(",").map((s) => literal(s.trim()));
  }
  if (text === "true" || text === "false") return text === "true";
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}

/** How many numbers a value of each numeric type holds; 1 means a bare number, not a list. */
const NUMERIC_SHAPES = { number: 1, integer: 1, point: 2, pair: 2, interval: 2 };

/** Types whose defaults are prose or mathematics, held to no range. */
const TEXTUAL = ["text", "latex", "span"];

/** Asserts a default (already parsed) is a value of `type` inside `range`. */
function conforms(value, type, range, where) {
  if (type.list) {
    assert.ok(Array.isArray(value), `${where}: default ${JSON.stringify(value)} is not a list`);
    if (range.items) {
      assert.ok(value.length >= range.items[0] && value.length <= range.items[1], `${where}: default has ${value.length} items, outside ${range.items}`);
    }
    for (const item of value) conforms(item, type.list, { ...range, items: null }, where);
    return;
  }
  if (type.enum) return assert.ok(type.enum.includes(value), `${where}: default "${value}" is not one of ${type.enum}`);
  if (type.name === "boolean") return assert.equal(typeof value, "boolean", `${where}: default is not true or false`);
  if (type.name in NUMERIC_SHAPES) {
    const bare = NUMERIC_SHAPES[type.name] === 1;
    const numbers = bare ? [value] : value;
    assert.ok(Array.isArray(numbers) && numbers.length === NUMERIC_SHAPES[type.name], `${where}: default is not a ${type.name}`);
    for (const n of numbers) {
      assert.equal(typeof n, "number", `${where}: default ${JSON.stringify(value)} is not numeric`);
      if (type.name === "integer") assert.ok(Number.isInteger(n), `${where}: default ${n} is not an integer`);
      if (range.bounds) assert.ok(n >= range.bounds[0] && n <= range.bounds[1], `${where}: default ${n} outside ${range.bounds}`);
      assert.ok(!range.excluding.includes(n), `${where}: default ${n} is excluded`);
    }
    if (type.name === "interval") assert.ok(numbers[0] < numbers[1], `${where}: default interval is empty`);
    return;
  }
  assert.equal(typeof value, "string", `${where}: default for ${type.name} is not text`);
}

/**
 * Holds one parameter or field table to the schema rules, returning its parsed rows. A Range
 * that names another parameter must name one in the same table, and a default under `within`
 * must lie inside that parameter's default interval.
 */
function schema(rows, known, where) {
  const parsedRows = rows.map(parseRow(known, where));
  const byName = new Map(parsedRows.map((r) => [r.name, r]));
  for (const { name, range, fallback } of parsedRows) {
    const at = `${where}, ${name}`;
    for (const other of [range.within, range.differsFrom, range.needs, range.onlyWhen?.param].filter(Boolean)) {
      assert.ok(byName.has(other), `${at}: refers to "${other}", not a parameter here`);
    }
    if (range.onlyWhen) {
      const { type } = byName.get(range.onlyWhen.param);
      assert.ok(type.enum?.includes(range.onlyWhen.value), `${at}: "${range.onlyWhen.value}" is not a value ${range.onlyWhen.param} can take`);
    }
    if (range.within && typeof literal(fallback) === "number") {
      const [min, max] = literal(unquote(byName.get(range.within).Default));
      const value = literal(fallback);
      assert.ok(value >= min && value <= max, `${at}: default ${value} is not within ${range.within}'s default`);
    }
  }
  return parsedRows;
}

/** A parser for one table's rows, remembering the names seen so a repeat fails. */
function parseRow(known, where) {
  const names = new Set();
  return (row) => {
    const at = `${where}, ${row.name}`;
    for (const column of COLUMNS) assert.ok(column in row, `${where}: no ${column} column`);
    assert.match(row.name, /^[a-z][a-z0-9-]*$/, `${at}: not a kebab-case name`);
    assert.ok(!names.has(row.name), `${at}: listed twice`);
    names.add(row.name);
    for (const column of COLUMNS) {
      assert.ok(row[column] !== "" && !/\b(TBD|TODO|tbc)\b|\?\?/i.test(row[column]), `${at}: ${column} is a placeholder`);
    }
    assert.ok(row.Required === "yes" || row.Required === "no", `${at}: Required is "${row.Required}", not yes or no`);

    const type = parseType(unquote(row.Type), known, at);
    const range = parseRange(unquote(row.Range), at);
    const fallback = unquote(row.Default);
    if (row.Required === "yes") assert.equal(fallback, "—", `${at}: a required parameter has a default`);
    else {
      assert.notEqual(fallback, "—", `${at}: an optional parameter has no default (write none if it is absent)`);
      // A composite default would be a mapping; every one is `none` or `[]`, and `[]` is checked.
      const composite = type.name && !SCALARS.includes(type.name);
      if (fallback !== "none" && !TEXTUAL.includes(type.name) && !composite) {
        conforms(literal(fallback), type, range, at);
      }
    }
    return { ...row, type, range, fallback };
  };
}

async function parsed() {
  const text = await catalogue();
  const lines = text.split("\n");

  const types = section(lines, "## Types");
  const composite = types.findIndex((l) => l.startsWith("### "));
  const scalarRows = table(composite === -1 ? types : types.slice(0, composite), "## Types");
  const composites = subsections(types, "####");
  const known = [...scalarRows.map((r) => r.name), ...composites.keys()];

  const archetypes = subsections(section(lines, "## Archetypes"), "###");
  return { text, lines, scalarRows, composites, known, archetypes };
}

test("the catalogue holds exactly the thirteen Archetypes of the spec, in its order", async () => {
  const { archetypes } = await parsed();
  assert.deepEqual([...archetypes.keys()], ARCHETYPES);
});

test("every type a schema uses is defined once, in ## Types", async () => {
  const { scalarRows, composites, known } = await parsed();
  assert.deepEqual(scalarRows.map((r) => r.name), SCALARS);
  for (const row of scalarRows) assert.ok(row["A value is"]?.length > 5, `${row.name}: no definition`);
  assert.deepEqual([...composites.keys()], ["function", "piece", "step", "quantity"]);
  for (const [name, lines] of composites) schema(table(lines, `type ${name}`), known, `type ${name}`);
});

test("the function type closes its families: each names its coefficients and what they mean", async () => {
  const { composites } = await parsed();
  const lines = composites.get("function");
  const families = table(lines.slice(lines.findIndex((l) => l.startsWith("| Family"))), "function families");
  const declared = table(lines, "type function").find((r) => r.name === "family");
  assert.deepEqual(families.map((f) => f.name), parseType(unquote(declared.Type), [], "family").enum);
  for (const family of families) {
    assert.match(family.Coefficients, /^\d+(–\d+)?$/, `${family.name}: coefficient count is not a number or a range`);
    assert.match(family.Means, /\$.+\$/, `${family.name}: its meaning is not written as mathematics`);
  }
});

test("every Archetype has a complete parameter schema, with every default inside its own range", async () => {
  const { archetypes, known } = await parsed();
  for (const [name, lines] of archetypes) {
    const rows = schema(table(lines, name), known, name);
    assert.ok(rows.length >= 3, `${name}: fewer than three parameters reads as a placeholder`);
  }
});

test("every Archetype carries a one-liner short enough for a Context Pack, and what it serves", async () => {
  const { archetypes } = await parsed();
  for (const [name, lines] of archetypes) {
    const oneLiner = lines.find((l) => l.startsWith("**One-liner:** "))?.slice("**One-liner:** ".length);
    assert.ok(oneLiner, `${name}: no one-liner`);
    assert.ok(oneLiner.length <= MAX_ONE_LINER, `${name}: one-liner is ${oneLiner.length} characters, over ${MAX_ONE_LINER}`);
    assert.match(oneLiner, /^[A-Z][^.]*\.$/, `${name}: one-liner is not a single sentence`);
    assert.ok(lines.some((l) => /^\*\*Serves:\*\* \S/.test(l)), `${name}: does not say what it serves`);
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

test("every Archetype has a worked example drawn from a real Note, using only its own parameters", async () => {
  const { archetypes, known } = await parsed();
  const notes = new Set();
  for (const domain of await readdir(VAULT, { withFileTypes: true })) {
    if (!domain.isDirectory() || domain.name.startsWith(".")) continue;
    for (const file of await readdir(join(VAULT, domain.name))) {
      if (file.endsWith(".md")) notes.add(basename(file, ".md"));
    }
  }

  for (const [name, lines] of archetypes) {
    const rows = schema(table(lines, name), known, name);
    const examples = [];
    for (const [i, line] of lines.entries()) {
      const heading = /^\*\*Example\*\* — \[\[([^\]]+)\]\]: \S/.exec(line);
      if (!heading) continue;
      // The block must come before the next Example, or two headings would share one block.
      const next = lines.findIndex((l, j) => j > i && l.startsWith("**Example**"));
      const open = lines.indexOf("```interactive", i);
      const close = lines.indexOf("```", open + 1);
      assert.ok(open > i && (next === -1 || open < next) && close > open, `${name}: example from ${heading[1]} has no interactive block`);
      examples.push({ note: heading[1], body: lines.slice(open + 1, close) });
    }
    assert.ok(examples.length >= 1, `${name}: no worked example`);

    for (const { note, body } of examples) {
      const at = `${name}, example from ${note}`;
      assert.ok(notes.has(note), `${at}: no such Note in the Wiki`);
      const keys = body.filter((l) => /^[a-z]/.test(l)).map((l) => l.split(":")[0]);
      assert.equal(keys[0], "archetype", `${at}: the block does not open by naming its archetype`);
      assert.equal(body[0], `archetype: ${name}`, `${at}: names the wrong archetype`);
      for (const key of keys.slice(1)) assert.ok(rows.some((r) => r.name === key), `${at}: "${key}" is not a parameter`);
      for (const row of rows.filter((r) => r.Required === "yes")) {
        assert.ok(keys.includes(row.name), `${at}: required parameter "${row.name}" is missing`);
      }
    }
  }
});

test("the catalogue records that it is a closed set, extended only through the Archetype Builder", async () => {
  const { lines } = await parsed();
  const closed = section(lines, "## A closed set").join("\n");
  assert.match(closed, /closed set/);
  assert.match(closed, /Archetype Builder/);
});
