// Invariant 9's core: an `interactive` block validated against the Archetype catalogue.
//
// Everything a schema says is read from docs/archetype-catalogue.md (see
// archetype-catalogue.js). Nothing here knows any Archetype, parameter or function family by
// name, so an Archetype the Archetype Builder adds is validated the moment it joins the
// catalogue. What this module owns is what each word of the catalogue's type and range grammar
// means for a value.
//
// Each problem carries a stable slug, so an agent can act on it without parsing prose:
//
//   malformed-yaml       the block is not YAML this reader accepts, or is not a mapping
//   missing-archetype    the block names no archetype
//   unknown-archetype    it names one the catalogue does not hold
//   missing-parameter    a required parameter, or a composite's required field, is absent
//   unknown-parameter    a parameter or field the schema does not declare
//   wrong-type           a value of the wrong type
//   out-of-range         a value of the right type that its Range refuses: a bound, an
//                        exclusion, an item count, `within`, `differs from`, or a count fixed
//                        by another field (a family's coefficients)
//   unmet-condition      a parameter given without the one it `needs`, or given when the
//                        parameter its `only when` names has another value
//   katex-rejects        a `latex` value KaTeX does not parse
//
// A parameter's path names it inside its block: `functions[1].coefficients` is the
// coefficients of the second function, counting from 0.

import { katexRejection } from "./maths.js";
import { YamlError, parseYaml } from "./yaml.js";

/**
 * Every problem with one block's YAML, in the order of the block's keys. `line` is the line
 * within the YAML the problem is on, when there is one to point at.
 *
 * @param {string} yaml the block's contents
 * @param {import("./archetype-catalogue.js").Catalogue} catalogue
 * @returns {{problem: string, message: string, line?: number, parameter?: string, archetype?: string}[]}
 */
export function validateInteractive(yaml, catalogue) {
  let parsed;
  try {
    parsed = parseYaml(yaml);
  } catch (error) {
    if (!(error instanceof YamlError)) throw error;
    return [{ problem: "malformed-yaml", line: error.line, message: `cannot read the block's YAML: ${error.message}` }];
  }

  const { value, keyLines } = parsed;
  if (value === null) {
    return [{ problem: "missing-archetype", message: "the block is empty: it must name an archetype and fill in its parameters" }];
  }
  if (!(value instanceof Map)) {
    return [{ problem: "malformed-yaml", line: 1, message: `the block must be a mapping of parameters, starting archetype: <name>, and is ${describe(value)}` }];
  }

  const name = value.get("archetype");
  if (name === undefined) {
    return [{ problem: "missing-archetype", message: "the block names no archetype: write archetype: <name> as its first line" }];
  }
  const line = keyLines.get("archetype");
  if (typeof name !== "string" || !catalogue.archetypes.has(name)) {
    const nearest = typeof name === "string" ? suggest(name, catalogue.archetypes.keys()) : "";
    return [{ problem: "unknown-archetype", line, archetype: String(name), message: `names archetype ${describe(name)}, which is not in the Archetype catalogue${nearest}` }];
  }

  const archetype = catalogue.archetypes.get(name);
  const parameters = new Map([...value].filter(([key]) => key !== "archetype"));
  return validateMapping(parameters, { fields: archetype.parameters, counts: [], owner: name, kind: "a parameter of" }, "", catalogue).map(
    (problem) => {
      const top = problem.parameter?.split(/[.[]/)[0];
      return keyLines.has(top) ? { line: keyLines.get(top), ...problem } : problem;
    },
  );
}

/**
 * The problems with a mapping held to a schema: an Archetype's parameters, or a composite
 * value's fields. A Range that names another parameter means one in this same mapping.
 */
function validateMapping(mapping, schema, path, catalogue) {
  const problems = [];
  const valid = new Set();
  const at = (key) => (path === "" ? key : `${path}.${key}`);

  for (const [key, value] of mapping) {
    const parameter = schema.fields.get(key);
    if (!parameter) {
      problems.push({
        problem: "unknown-parameter",
        parameter: at(key),
        message: `${at(key)} is not ${schema.kind} ${schema.owner}${suggest(key, schema.fields.keys())}`,
      });
      continue;
    }
    const found = validateValue(value, parameter.type, parameter.range, at(key), catalogue);
    if (found.length === 0) valid.add(key);
    problems.push(...found);
  }

  for (const parameter of schema.fields.values()) {
    if (parameter.required && !mapping.has(parameter.name)) {
      problems.push({
        problem: "missing-parameter",
        parameter: at(parameter.name),
        message: `${path === "" ? schema.owner : path} needs ${parameter.name}, and it is not given`,
      });
    }
  }

  /** What another parameter amounts to: its value if valid, else its default, else nothing. */
  const effective = (name) => {
    if (mapping.has(name)) return valid.has(name) ? { value: mapping.get(name), given: true } : undefined;
    const fallback = schema.fields.get(name).default;
    return fallback === undefined ? undefined : { value: fallback.value, given: false };
  };
  const shown = (name, other) => `${name} ${format(other.value)}${other.given ? "" : `, its default, since ${name} is not given`}`;

  for (const key of valid) {
    const { range } = schema.fields.get(key);
    const value = mapping.get(key);
    const where = at(key);
    if (range.within) {
      const other = effective(range.within);
      if (other && typeof value === "number" && (value < other.value[0] || value > other.value[1])) {
        problems.push({ problem: "out-of-range", parameter: where, message: `${where} is ${format(value)}, and must lie within ${shown(range.within, other)}` });
      }
    }
    if (range.differsFrom) {
      const other = effective(range.differsFrom);
      if (other && same(value, other.value)) {
        problems.push({ problem: "out-of-range", parameter: where, message: `${where} is ${format(value)}, the same as ${range.differsFrom}, and must differ from it` });
      }
    }
    if (range.needs && !mapping.has(range.needs)) {
      problems.push({ problem: "unmet-condition", parameter: where, message: `${where} is given without ${range.needs}, and needs it` });
    }
    if (range.onlyWhen) {
      const other = effective(range.onlyWhen.parameter);
      if (other && other.value !== range.onlyWhen.value) {
        problems.push({
          problem: "unmet-condition",
          parameter: where,
          message: `${where} is allowed only when ${range.onlyWhen.parameter} is ${range.onlyWhen.value}, and ${range.onlyWhen.parameter} is ${format(other.value)}`,
        });
      }
    }
  }

  for (const count of schema.counts) {
    if (!valid.has(count.selector) || !valid.has(count.counted)) continue;
    const selected = mapping.get(count.selector);
    const [min, max] = count.byValue.get(selected);
    const { length } = mapping.get(count.counted);
    if (length < min || length > max) {
      const takes = min === max ? `${min}` : `${min} to ${max}`;
      problems.push({
        problem: "out-of-range",
        parameter: at(count.counted),
        message: `${at(count.counted)}: ${article(selected)} ${selected} ${schema.owner} takes ${takes} ${count.counted}, and has ${length}`,
      });
    }
  }

  return problems;
}

/** What a value of each scalar type is, as a message says it must be. */
const SCALARS = {
  number: { is: (v) => Number.isFinite(v), must: "a number, such as 2 or -0.5" },
  integer: { is: Number.isInteger, must: "an integer" },
  boolean: { is: (v) => typeof v === "boolean", must: "true or false" },
  text: { is: (v) => typeof v === "string", must: "one line of plain words" },
  latex: { is: (v) => typeof v === "string", must: "LaTeX, single-quoted" },
  point: { is: isNumberPair, must: "a point, two numbers [x, y]" },
  pair: { is: isNumberPair, must: "a pair, two numbers [a, b]" },
  interval: { is: isNumberPair, must: "an interval, two numbers [min, max]" },
  span: { is: (v) => typeof v === "string", must: "a span in interval notation, single-quoted, such as '[-2, 3)'" },
};

/** The scalar types this module can validate; the catalogue may define no other. */
export const SCALAR_TYPES = Object.keys(SCALARS);

function isNumberPair(value) {
  return Array.isArray(value) && value.length === 2 && value.every((n) => Number.isFinite(n));
}

/**
 * The problems with one value of a type held to a Range's own terms: bounds, exclusions and
 * an item count. Exported so the catalogue's defaults are held to their ranges by the same
 * rules as a Note's values.
 */
export function validateValue(value, type, range, path, catalogue) {
  const wrong = (must, extra = "") => [{ problem: "wrong-type", parameter: path, message: `${path} must be ${must}, and is ${describe(value)}${extra}` }];

  if (type.list) {
    if (!Array.isArray(value)) return wrong(`a list of ${typeName(type.list)}`);
    const problems = [];
    if (range.items && (value.length < range.items[0] || value.length > range.items[1])) {
      problems.push({ problem: "out-of-range", parameter: path, message: `${path} has ${value.length} items, and takes ${range.items[0]} to ${range.items[1]}` });
    }
    const itemRange = { ...range, items: null };
    value.forEach((item, i) => problems.push(...validateValue(item, type.list, itemRange, `${path}[${i}]`, catalogue)));
    return problems;
  }

  if (type.enum) {
    return typeof value === "string" && type.enum.includes(value) ? [] : wrong(`one of ${type.enum.join(", ")}`);
  }

  if (type.composite) {
    const composite = catalogue.composites.get(type.composite);
    if (!(value instanceof Map)) return wrong(`${article(type.composite)} ${type.composite}, a mapping of ${[...composite.fields.keys()].join(", ")}`);
    return validateMapping(value, { ...composite, owner: type.composite, kind: "a field of" }, path, catalogue);
  }

  const scalar = SCALARS[type.scalar];
  if (!scalar.is(value)) return wrong(scalar.must);
  const problem = SHAPES[type.scalar]?.(value, path);
  if (problem) return [problem];
  return outOfBounds(numbersIn(value, type.scalar), range, path, value);
}

/** What a value of the right base type must also be, by type. */
const SHAPES = {
  text(value, path) {
    const markup = /[$\\`]|\[\[|\*\*/.exec(value);
    if (value.trim() === "" || /[\n\r]/.test(value) || markup) {
      const why = value.trim() === "" ? ", and is empty" : markup ? `, and holds ${markup[0]}` : ", and runs over more than one line";
      return { problem: "wrong-type", parameter: path, message: `${path} must be one line of plain words, with no LaTeX and no markup${why}` };
    }
  },
  latex(value, path) {
    if (value.trim() === "") return { problem: "wrong-type", parameter: path, message: `${path} must be LaTeX, and is empty` };
    if (/[\x00-\x1f\x7f]/.test(value)) {
      return {
        problem: "wrong-type",
        parameter: path,
        message: `${path} holds a control character, as a double-quoted "\\f" or "\\t" becomes one: single-quote LaTeX so a backslash stays a backslash`,
      };
    }
    const rejection = katexRejection({ expression: value, display: false });
    if (rejection !== undefined) {
      return { problem: "katex-rejects", parameter: path, expression: value, message: `${path}: KaTeX rejects '${value}': ${rejection}` };
    }
  },
  interval(value, path) {
    if (value[0] >= value[1]) {
      return { problem: "wrong-type", parameter: path, message: `${path} is ${format(value)}, and an interval's min must be below its max` };
    }
  },
  span(value, path) {
    if (readSpan(value) === undefined) {
      return {
        problem: "wrong-type",
        parameter: path,
        message: `${path} must be a span in interval notation, such as '[-2, 3)' or '(1, inf)', with its lower end below its upper and inf only at an open end, and is ${describe(value)}`,
      };
    }
  },
};

const SPAN_NUMBER = String.raw`[-+]?(?:\d+(?:\.\d*)?|\.\d+)`;
const SPAN = new RegExp(String.raw`^([[(])\s*(-inf|${SPAN_NUMBER})\s*,\s*(inf|${SPAN_NUMBER})\s*([\])])$`);

/** A span's two ends, or undefined when it is not one. */
function readSpan(text) {
  const match = SPAN.exec(text.trim());
  if (!match) return undefined;
  const [, open, low, high, close] = match;
  if ((low === "-inf" && open !== "(") || (high === "inf" && close !== ")")) return undefined;
  const ends = [low === "-inf" ? -Infinity : Number(low), high === "inf" ? Infinity : Number(high)];
  return ends[0] < ends[1] ? ends : undefined;
}

/** The numbers a value of a scalar type holds, which its Range's bounds apply to. */
function numbersIn(value, scalar) {
  if (scalar === "number" || scalar === "integer") return [value];
  if (scalar === "point" || scalar === "pair" || scalar === "interval") return value;
  if (scalar === "span") return readSpan(value).filter(Number.isFinite);
  return [];
}

function outOfBounds(numbers, range, path, value) {
  for (const n of numbers) {
    if (range.excluding.includes(n)) {
      return [{ problem: "out-of-range", parameter: path, message: `${path} cannot be ${format(n)}` }];
    }
    if (range.bounds && (n < range.bounds[0] || n > range.bounds[1])) {
      const bounds = `[${format(range.bounds[0])}, ${format(range.bounds[1])}]`;
      const message = typeof value === "number" ? `${path} is ${format(n)}, outside ${bounds}` : `${path} is ${format(value)}, and ${format(n)} is outside ${bounds}`;
      return [{ problem: "out-of-range", parameter: path, message }];
    }
  }
  return [];
}

function typeName(type) {
  if (type.list) return `list of ${typeName(type.list)}`;
  if (type.enum) return `one of ${type.enum.join(", ")}`;
  return type.composite ?? type.scalar;
}

function same(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
  return a === b;
}

const article = (word) => (/^[aeiou]/.test(word) ? "an" : "a");

/** A value as YAML would write it. */
export function format(value) {
  if (Array.isArray(value)) return `[${value.map(format).join(", ")}]`;
  if (value instanceof Map) return `{${[...value].map(([k, v]) => `${k}: ${format(v)}`).join(", ")}}`;
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : String(value).replace("Infinity", ".inf");
  return String(value);
}

/** A value, said in a sentence: what kind of thing it is when that is the point. */
function describe(value) {
  if (value === null) return "empty";
  if (value instanceof Map) return `a mapping, ${format(value)}`;
  if (Array.isArray(value)) return `a list, ${format(value)}`;
  if (typeof value === "string") return `the text ${format(value)}`;
  return format(value);
}

/** "; did you mean x?" for the nearest name within two edits, or nothing. */
function suggest(name, names) {
  let best;
  for (const candidate of names) {
    const distance = editDistance(name, candidate);
    if (distance <= 2 && (best === undefined || distance < best.distance)) best = { candidate, distance };
  }
  return best ? `; did you mean ${best.candidate}?` : "";
}

function editDistance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}
