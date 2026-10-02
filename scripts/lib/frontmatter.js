// A Note's frontmatter, read without a YAML library.
//
// The schema allows flat key-value pairs and arrays of scalars only (ADR-0003), so the
// reader accepts exactly that subset: `key: scalar`, `key: []`, `key: [a, b]`, and `key:`
// followed by `  - item` lines. Scalars may be plain, single-quoted or double-quoted.
// Anything else — a nested mapping, a block scalar, an indented line belonging to nothing —
// is not skipped but recorded as a problem naming the line, because a reader that drops
// what it does not understand reports a tidier Note than the one on disk. Invariant 7
// turns those problems into failures.
//
// A file whose first line is not `---` has no frontmatter. That absence is what makes a
// file structural rather than a Note (`CLAUDE.md`, `index.md`, `log.md`), so it is
// reported as `null`, never as a problem.

/**
 * @typedef {{value: string | string[] | null, line: number, unreadable?: true}} Entry
 * @typedef {{
 *   entries: Map<string, Entry>,
 *   problems: {line?: number, message: string}[],
 *   body: string,
 * }} Frontmatter
 */

/**
 * @param {string} source a whole Note
 * @returns {Frontmatter | null} null when the file carries no frontmatter at all
 */
export function readFrontmatter(source) {
  const lines = source.replace(/^﻿/, "").split(/\r?\n/);
  if (lines[0].trimEnd() !== "---") return null;

  const close = lines.findIndex((line, index) => index > 0 && /^(---|\.\.\.)\s*$/.test(line));
  if (close === -1) {
    return {
      entries: new Map(),
      problems: [{ line: 1, message: "the frontmatter opened on line 1 is never closed" }],
      body: "",
    };
  }

  const { entries, problems } = parseBlock(lines.slice(1, close));
  return { entries, problems, body: lines.slice(close + 1).join("\n") };
}

const KEY_LINE = /^([A-Za-z_][\w-]*)\s*:(?:\s+(.*?))?\s*$/;
const ITEM_LINE = /^\s*-(?:\s+(.*?))?\s*$/;

function parseBlock(lines) {
  const entries = new Map();
  const problems = [];
  // `lines[0]` is line 2 of the file: line 1 is the opening `---`.
  const lineNumber = (index) => index + 2;

  let open = null;
  for (const [index, text] of lines.entries()) {
    const line = lineNumber(index);
    if (text.trim() === "" || /^\s*#/.test(text)) continue;

    const item = ITEM_LINE.exec(text);
    if (item && open) {
      const value = readScalar(item[1] ?? "");
      if (value.problem) problems.push({ line, message: `${open.key}: ${value.problem}` });
      else (open.entry.value ??= []).push(value.value);
      continue;
    }

    const key = /^\S/.test(text) ? KEY_LINE.exec(text) : null;
    if (!key) {
      // The key this line hangs under is unreadable too, so it is not also reported as empty.
      if (open) open.entry.unreadable = true;
      problems.push({
        line,
        message: open
          ? `"${text.trim()}" under ${open.key} is neither a "- item" nor a new key: only flat keys and arrays of scalars are allowed`
          : `cannot read "${text.trim()}": only flat keys and arrays of scalars are allowed`,
      });
      continue;
    }

    const [, name, raw = ""] = key;
    open = null;
    if (entries.has(name)) {
      problems.push({ line, message: `${name} is declared twice, on lines ${entries.get(name).line} and ${line}` });
      continue;
    }

    const entry = { value: null, line };
    entries.set(name, entry);
    if (raw === "" || raw === "~" || raw === "null") {
      // An empty value, unless `- item` lines follow and make it the head of a list.
      open = { key: name, entry };
      continue;
    }
    const value = raw.startsWith("[") ? readFlowList(raw) : readValue(raw);
    if (value.problem) {
      entry.unreadable = true;
      problems.push({ line, message: `${name}: ${value.problem}` });
    } else entry.value = value.value;
  }

  return { entries, problems };
}

function readValue(raw) {
  if (raw.startsWith("{")) return { problem: "a nested mapping is not allowed; only flat keys and arrays of scalars" };
  if (raw.startsWith("|") || raw.startsWith(">")) return { problem: "a block scalar is not allowed" };
  return readScalar(raw);
}

/** `[a, "b, c", 'd']`: commas inside quotes belong to the item. */
function readFlowList(raw) {
  if (!raw.endsWith("]")) return { problem: `the list "${raw}" is never closed` };
  const inner = raw.slice(1, -1).trim();
  if (inner === "") return { value: [] };

  const items = [];
  let current = "";
  let quote = null;
  for (const character of inner) {
    if (quote) {
      current += character;
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      current += character;
      quote = character;
    } else if (character === ",") {
      items.push(current);
      current = "";
    } else current += character;
  }
  items.push(current);

  const values = [];
  for (const item of items) {
    const value = readScalar(item.trim());
    if (value.problem) return value;
    values.push(value.value);
  }
  return { value: values };
}

/** One scalar, unquoted. A nested list or mapping inside an array is refused. */
function readScalar(raw) {
  if (raw === "") return { problem: "an empty item" };
  if (raw.startsWith('"')) {
    const match = /^"((?:[^"\\]|\\.)*)"(?:\s+#.*)?$/.exec(raw);
    if (!match) return { problem: `cannot read the quoted value ${raw}` };
    try {
      return { value: JSON.parse(`"${match[1]}"`) };
    } catch {
      return { problem: `cannot read the escapes in ${raw}` };
    }
  }
  if (raw.startsWith("'")) {
    const match = /^'((?:[^']|'')*)'(?:\s+#.*)?$/.exec(raw);
    if (!match) return { problem: `cannot read the quoted value ${raw}` };
    return { value: match[1].replaceAll("''", "'") };
  }
  if (raw.startsWith("[") || raw.startsWith("{")) {
    return { problem: `${raw} nests a collection; only arrays of scalars are allowed` };
  }
  if (/^\S+:(\s|$)/.test(raw)) return { problem: `${raw} is a nested mapping; only flat keys are allowed` };
  return { value: raw.replace(/\s+#.*$/, "") };
}
