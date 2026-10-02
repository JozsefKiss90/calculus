// The YAML inside an `interactive` block, read without a YAML library.
//
// An Interactive is read twice: here, to validate it, and by the App, to render it with a
// real YAML parser. So this reader takes YAML's meaning wherever it accepts something, and
// refuses what it does not support rather than guessing. A value read one way here and
// another way in the App would pass `check` and still reach a learner broken.
//
// Supported: block mappings and block sequences nested by indentation, a sequence written at
// its key's own indentation, `- key: value` items, flow lists and flow mappings (which may run
// over several lines), plain, single-quoted and double-quoted scalars, and comments. Plain
// scalars resolve as YAML 1.2's core schema resolves them: `true`/`false`, `null`/`~`, and
// numbers; everything else is a string, so `'60'` is text and `yes` is not a boolean.
//
// Refused, each with a reason and the line: tabs in indentation, block scalars (`|`, `>`),
// anchors, aliases and tags, a key given twice, a plain value containing `: `, and a
// double-quoted escape YAML does not define, such as the `\s` of `"\sqrt{x}"`.
//
// A mapping is read as a `Map`, so a parameter named like an Object property is only a name.

export class YamlError extends Error {
  /** @param {number} line the 1-based line within the YAML text */
  constructor(message, line) {
    super(message);
    this.name = "YamlError";
    this.line = line;
  }
}

/**
 * The value a YAML document holds: a Map, an array, a string, a number, a boolean or null.
 * Also, for a top-level mapping, the line each of its keys is on.
 *
 * @param {string} text
 * @returns {{value: unknown, keyLines: Map<string, number>}}
 * @throws {YamlError}
 */
export function parseYaml(text) {
  const lines = toLines(text);
  if (lines.length === 0) return { value: null, keyLines: new Map() };
  const reader = { lines, index: 0, keyLines: new Map() };
  const value = readBlock(reader, lines[0].indent, true);
  if (reader.index < lines.length) {
    const line = lines[reader.index];
    throw new YamlError(`"${line.text}" is indented less than the lines before it, and belongs to nothing`, line.number);
  }
  return { value, keyLines: reader.keyLines };
}

/**
 * One flow value on its own: a scalar, `[…]` or `{…}`. This is how the catalogue's Default
 * cells are read, so a default and a value in a Note mean the same thing.
 *
 * @throws {YamlError}
 */
export function parseFlowValue(text) {
  return readInline(text, 1);
}

/** The meaningful lines: comments stripped, blank lines dropped, indentation measured. */
function toLines(text) {
  const lines = [];
  for (const [index, raw] of text.replace(/^﻿/, "").split(/\r?\n/).entries()) {
    const number = index + 1;
    const leading = /^[ \t]*/.exec(raw)[0];
    const content = stripComment(raw.slice(leading.length), number).trimEnd();
    if (content === "") continue;
    if (leading.includes("\t")) throw new YamlError("a tab in the indentation: YAML indents with spaces only", number);
    if (leading === "" && /^(---|\.\.\.)$/.test(content)) {
      throw new YamlError(`${content} marks a YAML document, and a block holds just one: leave it out`, number);
    }
    lines.push({ indent: leading.length, text: content, number });
  }
  return lines;
}

/** The line without its comment: a `#` at the start or after a space, outside quotes. */
function stripComment(text, number) {
  let quote = null;
  // How deep inside a flow collection opened on this line, where `[`, `{` and `,` start values.
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote === '"') {
      if (char === "\\") i += 1;
      else if (char === '"') quote = null;
    } else if (quote === "'") {
      if (char === "'") quote = null;
    } else if (char === "#" && (i === 0 || /\s/.test(text[i - 1]))) {
      return text.slice(0, i);
    } else if ((char === '"' || char === "'") && startsValue(text, i, depth)) {
      quote = char;
    } else if ((char === "[" || char === "{") && (depth > 0 || startsValue(text, i, depth))) {
      depth += 1;
    } else if ((char === "]" || char === "}") && depth > 0) {
      depth -= 1;
    }
  }
  if (quote) throw new YamlError(`the quoted value in "${text.trim()}" is never closed on its line`, number);
  return text;
}

/**
 * Whether a value starts at `i`: at the start of the line, after `key:`, after a list item's
 * `-`, or, inside a flow collection, after `[`, `{` or `,`. Only there does a quote open a
 * quoted value or a bracket a collection; elsewhere each is part of a plain value, as in
 * "the 'limit" or "f(2), 'the jump".
 */
function startsValue(text, i, depth) {
  let j = i - 1;
  while (j >= 0 && text[j] === " ") j -= 1;
  if (j < 0) return true;
  if (text[j] === "-") return j === 0 || text[j - 1] === " ";
  if (text[j] === ":") return j < i - 1;
  return depth > 0 && /[[{,]/.test(text[j]);
}

const SEQUENCE_ITEM = /^-(?: +|$)/;
const KEY = /^(?:([A-Za-z0-9_][\w-]*)|'((?:[^']|'')*)'|"((?:[^"\\]|\\.)*)")\s*:(?: +(.*))?$/;

/** The block at `indent` starting at the reader's line: a mapping, a sequence or a scalar. */
function readBlock(reader, indent, topLevel = false) {
  const line = reader.lines[reader.index];
  if (SEQUENCE_ITEM.test(line.text)) return readSequence(reader, indent);
  if (KEY.test(line.text)) return readMapping(reader, indent, topLevel);
  // A lone scalar on its own line, under a key with nothing after its colon.
  reader.index += 1;
  return readContinued(reader, line, indent);
}

function readMapping(reader, indent, topLevel) {
  const mapping = new Map();
  while (reader.index < reader.lines.length) {
    const line = reader.lines[reader.index];
    if (line.indent < indent) break;
    if (line.indent > indent) throw new YamlError(`"${line.text}" is indented further than the key before it, which already has a value`, line.number);
    const match = KEY.exec(line.text);
    if (!match) {
      throw new YamlError(
        SEQUENCE_ITEM.test(line.text)
          ? `"${line.text}" is a list item among keys: indent it under the key it belongs to`
          : `cannot read "${line.text}": expected "key: value"`,
        line.number,
      );
    }
    const key = match[1] ?? (match[2] !== undefined ? match[2].replaceAll("''", "'") : unescapeDouble(match[3], line.number));
    if (mapping.has(key)) throw new YamlError(`${key} is given twice`, line.number);
    if (topLevel) reader.keyLines.set(key, line.number);
    reader.index += 1;
    mapping.set(key, readValueAfterKey(reader, line, match[4], indent));
  }
  return mapping;
}

/** What follows `key:` — on the same line, on the lines below it, or nothing. */
function readValueAfterKey(reader, line, rest, indent) {
  if (rest !== undefined && rest.trim() !== "") return readContinued(reader, { ...line, text: rest.trim() }, indent);
  const next = reader.lines[reader.index];
  if (next && next.indent > indent) return readBlock(reader, next.indent);
  // YAML lets a list sit at its key's own indentation.
  if (next && next.indent === indent && SEQUENCE_ITEM.test(next.text)) return readSequence(reader, indent);
  return null;
}

function readSequence(reader, indent) {
  const items = [];
  while (reader.index < reader.lines.length) {
    const line = reader.lines[reader.index];
    if (line.indent < indent) break;
    if (line.indent > indent) throw new YamlError(`"${line.text}" is indented further than the list item before it`, line.number);
    const marker = SEQUENCE_ITEM.exec(line.text);
    if (!marker) break;
    const rest = line.text.slice(marker[0].length);
    if (rest === "") {
      reader.index += 1;
      const next = reader.lines[reader.index];
      items.push(next && next.indent > indent ? readBlock(reader, next.indent) : null);
    } else if (SEQUENCE_ITEM.test(rest) || KEY.test(rest)) {
      // `- key: value` opens a mapping (or `- - x` a list) whose column is where `key` stands.
      reader.lines[reader.index] = { ...line, indent: indent + marker[0].length, text: rest };
      items.push(readBlock(reader, indent + marker[0].length));
    } else {
      reader.index += 1;
      items.push(readContinued(reader, { ...line, text: rest }, indent));
    }
  }
  return items;
}

/**
 * An inline value, which may be a flow collection carried on over the following lines that
 * are indented further than `indent`. A plain scalar may not run on.
 */
function readContinued(reader, line, indent) {
  let text = line.text;
  if (/^[|>][-+0-9]*$/.test(text)) {
    throw new YamlError(`a block scalar (${text[0]}) is not supported: write the value on one line`, line.number);
  }
  if (text.startsWith("[") || text.startsWith("{")) {
    while (!balanced(text) && reader.index < reader.lines.length && reader.lines[reader.index].indent > indent) {
      text += ` ${reader.lines[reader.index].text}`;
      reader.index += 1;
    }
  }
  const next = reader.lines[reader.index];
  if (next && next.indent > indent) {
    throw new YamlError(`"${next.text}" is indented under a value that is already complete; write a value on one line`, next.number);
  }
  return readInline(text, line.number);
}

/** Whether every bracket opened outside quotes is closed. */
function balanced(text) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote === '"' && char === "\\") i += 1;
    else if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "[" || char === "{") depth += 1;
    else if (char === "]" || char === "}") depth -= 1;
  }
  return depth <= 0;
}

/** A whole inline value: nothing may follow it. */
function readInline(text, number) {
  const cursor = { text, at: 0, number };
  const first = text[0];
  if (first === "|" || first === ">") {
    throw new YamlError(`a block scalar (${first}) is not supported: write the value on one line`, number);
  }
  if (!"[{'\"".includes(first)) return readPlain(text, number);
  const value = readFlow(cursor);
  skipSpace(cursor);
  if (cursor.at < text.length) {
    throw new YamlError(`unexpected "${text.slice(cursor.at)}" after ${text.slice(0, cursor.at).trim()}`, number);
  }
  return value;
}

function readPlain(text, number) {
  if (/^[&*!]/.test(text)) throw new YamlError(`anchors, aliases and tags (${text[0]}) are not supported`, number);
  if (/^[@`%]/.test(text)) throw new YamlError(`a value cannot start with ${text[0]}: quote it`, number);
  if (/:(\s|$)/.test(text)) {
    throw new YamlError(`"${text}" holds ": ", which YAML reads as a key: quote the value`, number);
  }
  if (/^- /.test(text) || text === "-") throw new YamlError(`"${text}" is a list item where a value was expected`, number);
  return resolvePlain(text);
}

/** YAML 1.2's core schema: what a plain scalar means. */
function resolvePlain(text) {
  if (/^(null|Null|NULL|~)$/.test(text)) return null;
  if (/^(true|True|TRUE)$/.test(text)) return true;
  if (/^(false|False|FALSE)$/.test(text)) return false;
  if (/^[-+]?(\.[0-9]+|[0-9]+(\.[0-9]*)?)([eE][-+]?[0-9]+)?$/.test(text)) return Number(text);
  if (/^0o[0-7]+$/.test(text)) return parseInt(text.slice(2), 8);
  if (/^0x[0-9a-fA-F]+$/.test(text)) return parseInt(text.slice(2), 16);
  if (/^[-+]?\.(inf|Inf|INF)$/.test(text)) return text.startsWith("-") ? -Infinity : Infinity;
  if (/^\.(nan|NaN|NAN)$/.test(text)) return NaN;
  return text;
}

function skipSpace(cursor) {
  while (cursor.at < cursor.text.length && /\s/.test(cursor.text[cursor.at])) cursor.at += 1;
}

/** One value inside flow context, where `,`, `]` and `}` end a plain scalar. */
function readFlow(cursor) {
  skipSpace(cursor);
  const char = cursor.text[cursor.at];
  if (char === "[") return readFlowSequence(cursor);
  if (char === "{") return readFlowMapping(cursor);
  if (char === "'" || char === '"') return readQuoted(cursor);
  const start = cursor.at;
  while (cursor.at < cursor.text.length && !/[,[\]{}]/.test(cursor.text[cursor.at])) cursor.at += 1;
  const plain = cursor.text.slice(start, cursor.at).trim();
  if (plain === "") throw new YamlError(`a value is missing in ${cursor.text}`, cursor.number);
  return readPlain(plain, cursor.number);
}

function readFlowSequence(cursor) {
  cursor.at += 1;
  const items = [];
  for (;;) {
    skipSpace(cursor);
    if (cursor.at >= cursor.text.length) throw new YamlError(`the list ${cursor.text} is never closed`, cursor.number);
    if (cursor.text[cursor.at] === "]") {
      cursor.at += 1;
      return items;
    }
    items.push(readFlow(cursor));
    skipSpace(cursor);
    const next = cursor.text[cursor.at];
    if (next === ",") cursor.at += 1;
    else if (next !== "]") {
      throw new YamlError(next === undefined ? `the list ${cursor.text} is never closed` : `expected , or ] in ${cursor.text}`, cursor.number);
    }
  }
}

function readFlowMapping(cursor) {
  cursor.at += 1;
  const mapping = new Map();
  for (;;) {
    skipSpace(cursor);
    if (cursor.at >= cursor.text.length) throw new YamlError(`the mapping ${cursor.text} is never closed`, cursor.number);
    if (cursor.text[cursor.at] === "}") {
      cursor.at += 1;
      return mapping;
    }
    const key = readFlowKey(cursor);
    if (mapping.has(key)) throw new YamlError(`${key} is given twice`, cursor.number);
    mapping.set(key, readFlow(cursor));
    skipSpace(cursor);
    const next = cursor.text[cursor.at];
    if (next === ",") cursor.at += 1;
    else if (next !== "}") {
      throw new YamlError(next === undefined ? `the mapping ${cursor.text} is never closed` : `expected , or } in ${cursor.text}`, cursor.number);
    }
  }
}

function readFlowKey(cursor) {
  const char = cursor.text[cursor.at];
  let key;
  if (char === "'" || char === '"') key = readQuoted(cursor);
  else {
    const match = /^[A-Za-z0-9_][\w-]*/.exec(cursor.text.slice(cursor.at));
    if (!match) throw new YamlError(`expected a key in ${cursor.text}`, cursor.number);
    key = match[0];
    cursor.at += key.length;
  }
  skipSpace(cursor);
  if (cursor.text[cursor.at] !== ":") throw new YamlError(`expected ":" after ${key} in ${cursor.text}`, cursor.number);
  // After a plain key YAML needs a space: `family:linear` is one value, not a key and a value.
  if (char !== "'" && char !== '"' && !/^(\s|[,\]}]|$)/.test(cursor.text.slice(cursor.at + 1))) {
    throw new YamlError(`${key}:${cursor.text.slice(cursor.at + 1).split(/[\s,\]}]/)[0]} is one value in YAML: write a space after the colon`, cursor.number);
  }
  cursor.at += 1;
  return key;
}

function readQuoted(cursor) {
  const quote = cursor.text[cursor.at];
  const rest = cursor.text.slice(cursor.at);
  const match = quote === "'" ? /^'((?:[^']|'')*)'/.exec(rest) : /^"((?:[^"\\]|\\.)*)"/.exec(rest);
  if (!match) throw new YamlError(`the quoted value ${rest} is never closed`, cursor.number);
  cursor.at += match[0].length;
  return quote === "'" ? match[1].replaceAll("''", "'") : unescapeDouble(match[1], cursor.number);
}

/** YAML's double-quoted escapes. Any other backslash is an error, as it is in YAML. */
const ESCAPES = {
  0: "\0", a: "\x07", b: "\b", t: "\t", "\t": "\t", n: "\n", v: "\v", f: "\f", r: "\r", e: "\x1b",
  " ": " ", '"': '"', "/": "/", "\\": "\\", N: "\x85", _: "\xa0", L: " ", P: " ",
};
const HEX_ESCAPES = { x: 2, u: 4, U: 8 };

function unescapeDouble(body, number) {
  let out = "";
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] !== "\\") {
      out += body[i];
      continue;
    }
    const code = body[i + 1];
    if (code in HEX_ESCAPES) {
      const digits = body.slice(i + 2, i + 2 + HEX_ESCAPES[code]);
      if (!new RegExp(`^[0-9a-fA-F]{${HEX_ESCAPES[code]}}$`).test(digits)) {
        throw new YamlError(`\\${code}${digits} is not a complete escape; single-quote a value holding LaTeX`, number);
      }
      out += String.fromCodePoint(parseInt(digits, 16));
      i += 1 + HEX_ESCAPES[code];
    } else if (Object.hasOwn(ESCAPES, code)) {
      out += ESCAPES[code];
      i += 1;
    } else {
      throw new YamlError(`\\${code} is not an escape in a double-quoted value; single-quote a value holding LaTeX`, number);
    }
  }
  return out;
}
