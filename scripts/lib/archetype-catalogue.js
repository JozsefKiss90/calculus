// docs/archetype-catalogue.md, read as the schemas invariant 9 validates against.
//
// The catalogue is one markdown file that people review and `check` reads, so there is no
// second copy to drift from it. This is the one parser of its tables. It reads the scalar
// types, the composite types with their fields, each Archetype's parameter table, and each
// composite's extra tables that fix how many items a list field holds for each value of an
// enum field (the function families' coefficient counts). Every cell is written in the
// catalogue's own type grammar and range grammar.
//
// A catalogue this cannot read in full is refused, never read in part, because a schema
// misread here passes Interactives that should fail. So is one that breaks its own rules: a
// required parameter with a default, a default outside its own range, a Range naming a
// parameter that is not there. A refused catalogue stops `check` before it judges any Note.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { YamlError, parseFlowValue } from "./yaml.js";
import { SCALAR_TYPES, format, validateValue } from "./interactives.js";

export const CATALOGUE_PATH = fileURLToPath(new URL("../../docs/archetype-catalogue.md", import.meta.url));
const SHOWN_PATH = "docs/archetype-catalogue.md";

export class CatalogueError extends Error {
  constructor(message) {
    super(`${SHOWN_PATH} cannot be used: ${message}`);
    this.name = "CatalogueError";
  }
}

/**
 * @typedef {{scalar: string} | {enum: string[]} | {list: Type} | {composite: string}} Type
 * @typedef {{
 *   bounds: [number, number] | null, items: [number, number] | null, excluding: number[],
 *   within: string | null, differsFrom: string | null, needs: string | null,
 *   onlyWhen: {parameter: string, value: string} | null,
 * }} Range
 * @typedef {{name: string, type: Type, required: boolean, default?: {value: unknown}, range: Range}} Parameter
 * @typedef {{selector: string, counted: string, byValue: Map<string, [number, number]>}} Count
 * @typedef {{
 *   composites: Map<string, {fields: Map<string, Parameter>, counts: Count[]}>,
 *   archetypes: Map<string, {name: string, oneLiner: string, serves: string, parameters: Map<string, Parameter>}>,
 * }} Catalogue
 */

/** @returns {Promise<Catalogue>} */
export async function loadCatalogue(path = CATALOGUE_PATH) {
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") throw new CatalogueError("the file does not exist");
    throw error;
  }
  return parseCatalogue(text);
}

/**
 * @param {string} text the catalogue's markdown
 * @returns {Catalogue}
 * @throws {CatalogueError}
 */
export function parseCatalogue(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const types = section(lines, "## Types");
  const compositeStart = types.findIndex((line) => line.startsWith("### "));
  const scalars = tables(compositeStart === -1 ? types : types.slice(0, compositeStart), "## Types")[0].map((row) => row.name);
  const missing = scalars.filter((name) => !SCALAR_TYPES.includes(name));
  if (missing.length > 0) throw new CatalogueError(`## Types defines ${missing.join(", ")}, which check has no rule for`);
  const undefinedHere = SCALAR_TYPES.filter((name) => !scalars.includes(name));
  if (undefinedHere.length > 0) throw new CatalogueError(`## Types does not define ${undefinedHere.join(", ")}`);

  const compositeSections = subsections(types, "####");
  const known = { scalars, composites: [...compositeSections.keys()] };
  const catalogue = { composites: new Map(), archetypes: new Map() };

  for (const [name, body] of compositeSections) {
    const where = `type ${name}`;
    const [fieldRows, ...extra] = tables(body, where);
    const fields = schema(fieldRows, known, where);
    catalogue.composites.set(name, { fields, counts: extra.flatMap((rows) => counts(rows, fields, where)) });
  }

  const archetypeSections = subsections(section(lines, "## Archetypes"), "###");
  if (archetypeSections.size === 0) throw new CatalogueError("## Archetypes holds no Archetype");
  for (const [name, body] of archetypeSections) {
    const parameters = schema(tables(body, name)[0], known, name);
    if (parameters.has("archetype")) throw new CatalogueError(`${name}: "archetype" names the Archetype, and cannot be a parameter`);
    catalogue.archetypes.set(name, {
      name,
      oneLiner: labelled(body, "One-liner", name),
      serves: labelled(body, "Serves", name),
      parameters,
    });
  }

  // Defaults are held to their own ranges by the same rules as a Note's values, once every
  // composite is known.
  for (const [owner, fields] of [
    ...[...catalogue.composites].map(([name, composite]) => [`type ${name}`, composite.fields]),
    ...[...catalogue.archetypes].map(([name, archetype]) => [name, archetype.parameters]),
  ]) {
    checkDefaults(fields, owner, catalogue);
  }
  return catalogue;
}

/** The lines under `heading`, up to the next heading of the same or a higher level. */
function section(lines, heading) {
  const start = lines.indexOf(heading);
  if (start === -1) throw new CatalogueError(`there is no "${heading}" section`);
  const level = heading.match(/^#+/)[0].length;
  const end = lines.findIndex((line, i) => i > start && new RegExp(`^#{1,${level}} `).test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end);
}

/** Every `### \`name\`` (or `####`) subsection, by name. */
function subsections(lines, marker) {
  const found = new Map();
  let current = null;
  for (const line of lines) {
    const match = new RegExp(`^${marker} \`([a-z][a-z0-9-]*)\`$`).exec(line);
    if (match) {
      if (found.has(match[1])) throw new CatalogueError(`${match[1]} is defined twice`);
      found.set(match[1], (current = []));
    } else if (line.startsWith(`${marker} `)) {
      // Every heading at this level names one; a misspelt one is refused, not skipped.
      throw new CatalogueError(`the heading "${line}" is not ${marker} \`name\`, with a lower-case hyphenated name`);
    } else if (/^#{1,4} /.test(line)) current = null;
    else current?.push(line);
  }
  return found;
}

const cells = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
const unquote = (cell) => cell.replace(/^`(.*)`$/, "$1");

/** Every table in `lines`, each as rows keyed by its header, with the first cell as `name`. */
function tables(lines, where) {
  const found = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith("|")) continue;
    let end = i;
    while (end < lines.length && lines[end].startsWith("|")) end += 1;
    const [header, rule, ...body] = lines.slice(i, end);
    if (!rule || !/^\|(\s*:?-+:?\s*\|)+$/.test(rule)) throw new CatalogueError(`${where}: a table has no header rule`);
    const names = cells(header);
    found.push(
      body.map((row) => {
        const values = cells(row);
        if (values.length !== names.length) throw new CatalogueError(`${where}: "${row}" has ${values.length} cells, and the header ${names.length}`);
        return { ...Object.fromEntries(names.map((n, j) => [n, values[j]])), name: unquote(values[0]) };
      }),
    );
    i = end;
  }
  if (found.length === 0 || found[0].length === 0) throw new CatalogueError(`${where}: no table with a row`);
  return found;
}

/** The text after `**Label:** ` in a section. */
function labelled(lines, label, where) {
  const prefix = `**${label}:** `;
  const line = lines.find((l) => l.startsWith(prefix));
  if (!line) throw new CatalogueError(`${where}: no ${label}`);
  return line.slice(prefix.length).trim();
}

const COLUMNS = ["Type", "Required", "Default", "Range", "Meaning"];

/** One parameter table, read and held to the schema rules. */
function schema(rows, known, where) {
  const fields = new Map();
  for (const row of rows) {
    const at = `${where}, ${row.name}`;
    for (const column of COLUMNS) if (!(column in row)) throw new CatalogueError(`${where}: the table has no ${column} column`);
    if (!/^[a-z][a-z0-9-]*$/.test(row.name)) throw new CatalogueError(`${at}: not a lower-case hyphenated name`);
    if (fields.has(row.name)) throw new CatalogueError(`${at}: listed twice`);
    if (row.Required !== "yes" && row.Required !== "no") throw new CatalogueError(`${at}: Required is "${row.Required}", not yes or no`);

    const type = parseType(unquote(row.Type), known, at);
    const range = parseRange(unquote(row.Range), at);
    const required = row.Required === "yes";
    const cell = unquote(row.Default);
    const parameter = { name: row.name, type, required, range };
    if (required) {
      if (cell !== "—") throw new CatalogueError(`${at}: a required parameter has the default ${cell}`);
    } else if (cell === "—") {
      throw new CatalogueError(`${at}: an optional parameter has no default; write none if it is absent`);
    } else if (cell !== "none" || type.enum?.includes("none")) {
      parameter.default = { value: readDefault(cell, at) };
    }
    fields.set(row.name, parameter);
  }

  for (const { name, range } of fields.values()) {
    const at = `${where}, ${name}`;
    for (const other of [range.within, range.differsFrom, range.needs, range.onlyWhen?.parameter].filter(Boolean)) {
      if (!fields.has(other)) throw new CatalogueError(`${at}: its Range names ${other}, which is not a parameter here`);
      if (other === name) throw new CatalogueError(`${at}: its Range names itself`);
    }
    if (range.within && fields.get(range.within).type.scalar !== "interval") {
      throw new CatalogueError(`${at}: within ${range.within}, which is not an interval`);
    }
    if (range.within && !["number", "integer"].includes(fields.get(name).type.scalar)) {
      throw new CatalogueError(`${at}: within applies only to a number`);
    }
    if (range.onlyWhen && !fields.get(range.onlyWhen.parameter).type.enum?.includes(range.onlyWhen.value)) {
      throw new CatalogueError(`${at}: only when ${range.onlyWhen.parameter} is ${range.onlyWhen.value}, which is not a value ${range.onlyWhen.parameter} can take`);
    }
  }
  return fields;
}

function readDefault(cell, at) {
  try {
    return parseFlowValue(cell);
  } catch (error) {
    if (!(error instanceof YamlError)) throw error;
    throw new CatalogueError(`${at}: cannot read the default ${cell}: ${error.message}`);
  }
}

/** A Type cell: a scalar or composite name, `enum(a, b, …)` or `list of <type>`. */
function parseType(text, known, where) {
  const list = /^list of (.+)$/.exec(text);
  if (list) return { list: parseType(list[1], known, where) };
  const enumeration = /^enum\(([a-z0-9-]+(?:, [a-z0-9-]+)*)\)$/.exec(text);
  if (enumeration) return { enum: enumeration[1].split(", ") };
  if (known.scalars.includes(text)) return { scalar: text };
  if (known.composites.includes(text)) return { composite: text };
  throw new CatalogueError(`${where}: the type "${text}" is not defined in ## Types`);
}

const RANGE_NUMBER = String.raw`-?\d+(?:\.\d+)?`;
const RANGE_TERMS = [
  [new RegExp(`^\\[(${RANGE_NUMBER}), (${RANGE_NUMBER})\\] items$`), (range, m) => (range.items = [Number(m[1]), Number(m[2])])],
  [new RegExp(`^\\[(${RANGE_NUMBER}), (${RANGE_NUMBER})\\]$`), (range, m) => (range.bounds = [Number(m[1]), Number(m[2])])],
  [new RegExp(`^excluding (${RANGE_NUMBER})$`), (range, m) => range.excluding.push(Number(m[1]))],
  [/^within ([a-z][a-z0-9-]*)$/, (range, m) => (range.within = m[1])],
  [/^differs from ([a-z][a-z0-9-]*)$/, (range, m) => (range.differsFrom = m[1])],
  [/^needs ([a-z][a-z0-9-]*)$/, (range, m) => (range.needs = m[1])],
  [/^only when ([a-z][a-z0-9-]*) is ([a-z0-9-]+)$/, (range, m) => (range.onlyWhen = { parameter: m[1], value: m[2] })],
];

/** A Range cell: `—`, or terms joined by `; `. */
function parseRange(text, where) {
  const range = { bounds: null, items: null, excluding: [], within: null, differsFrom: null, needs: null, onlyWhen: null };
  if (text === "—") return range;
  for (const term of text.split("; ")) {
    const known = RANGE_TERMS.find(([pattern]) => pattern.test(term));
    if (!known) throw new CatalogueError(`${where}: the range term "${term}" is not in the range grammar`);
    known[1](range, known[0].exec(term));
  }
  if (range.bounds && range.bounds[0] >= range.bounds[1]) throw new CatalogueError(`${where}: the range ${text} is empty`);
  if (range.items && range.items[0] > range.items[1]) throw new CatalogueError(`${where}: the item range ${text} is empty`);
  return range;
}

/**
 * A composite's extra table that fixes a list field's length per value of an enum field: its
 * first column names the enum field (`Family` for `family`), and each column named after a
 * list field (`Coefficients`) holds a count, `n` or `a–b`. Columns naming no field are prose.
 */
function counts(rows, fields, where) {
  const header = Object.keys(rows[0]).filter((key) => key !== "name");
  const selector = header[0].toLowerCase();
  const field = fields.get(selector);
  if (!field?.type.enum) throw new CatalogueError(`${where}: the table headed ${header[0]} does not name an enum field`);
  const listed = rows.map((row) => row.name);
  if (listed.length !== field.type.enum.length || listed.some((value, i) => value !== field.type.enum[i])) {
    throw new CatalogueError(`${where}: the ${header[0]} table lists ${listed.join(", ")}, and ${selector} takes ${field.type.enum.join(", ")}`);
  }

  return header
    .slice(1)
    .filter((column) => fields.get(column.toLowerCase())?.type.list)
    .map((column) => {
      const counted = column.toLowerCase();
      const byValue = new Map();
      for (const row of rows) {
        const count = /^(\d+)(?:[–-](\d+))?$/.exec(row[column]);
        if (!count) throw new CatalogueError(`${where}, ${row.name}: ${column} is "${row[column]}", not a count or a range of counts`);
        byValue.set(row.name, [Number(count[1]), Number(count[2] ?? count[1])]);
      }
      return { selector, counted, byValue };
    });
}

/** Every default is a value of its type inside its own range, `within` included. */
function checkDefaults(fields, owner, catalogue) {
  for (const parameter of fields.values()) {
    if (parameter.default === undefined) continue;
    const { value } = parameter.default;
    const at = `${owner}, ${parameter.name}`;
    const problems = validateValue(value, parameter.type, parameter.range, parameter.name, catalogue);
    if (problems.length > 0) throw new CatalogueError(`${at}: the default ${format(value)} is refused: ${problems[0].message}`);
    const within = parameter.range.within && fields.get(parameter.range.within).default?.value;
    if (within && (value < within[0] || value > within[1])) {
      throw new CatalogueError(`${at}: the default ${format(value)} is not within ${parameter.range.within}'s default ${format(within)}`);
    }
  }
}
