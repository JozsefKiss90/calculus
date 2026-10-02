// A Note's mathematics, found the way Obsidian finds it and parsed the way KaTeX parses it.
//
// Obsidian renders with MathJax and the App will render with KaTeX, so the binding dialect
// is what both accept (ADR-0006). MathJax is the more permissive of the two in practice —
// `\bbox`, `\require`, `\class`, `\style` and `\cssId` are MathJax-only — so parsing under
// the real KaTeX, not a list of banned macros, is what invariant 8 asks.
//
// Finding the mathematics is the half that has to agree with Obsidian, because an expression
// this misses is never checked and prose this mistakes for mathematics is a false failure:
//
//   - Fenced code blocks (``` or ~~~), code spans, HTML comments and Obsidian's `%%`
//     comments are not prose, and a dollar sign inside one is not mathematics. Whichever of
//     them opens first wins, so a `<!--` inside a code span hides nothing.
//   - `\$` is a literal dollar sign, and an escaped backtick opens no code span.
//   - `$$…$$` is display mathematics and may span lines. One left open is a failure: it
//     renders as dollar signs and swallows the prose after it. One left open before a later
//     display block pairs with that block's opening `$$`, as it does on the page, and is
//     reported as the expression KaTeX then rejects.
//   - `$…$` is inline mathematics when the opening `$` is followed by a non-space, the closing
//     `$` is preceded by a non-space and not followed by a digit, and no blank line lies
//     between them (Pandoc's rule). So "$5 and $2" is prose, and an inline `$` that never
//     closes is a dollar sign rather than a failure. A price followed by mathematics in the
//     same paragraph does pair with it, and fails: write a price's dollar as `\$`.

import katex from "../vendor/katex/katex.mjs";

/**
 * Every expression in a Note's body, and every display block left open.
 *
 * @param {string} body the Note below its frontmatter, LF line endings
 * @param {number} bodyLine the body's first line in the file
 * @returns {{
 *   expressions: {expression: string, display: boolean, line: number}[],
 *   unclosed: {line: number}[],
 * }}
 */
export function findMaths(body, bodyLine) {
  const text = maskCode(body);
  const lineAt = (index) => bodyLine + countNewlines(text, index);
  const expressions = [];
  const unclosed = [];

  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (char === "\\") {
      i += 2;
    } else if (char !== "$") {
      i += 1;
    } else if (text[i + 1] === "$") {
      const close = closingDisplay(text, i + 2);
      if (close === -1) {
        unclosed.push({ line: lineAt(i) });
        i += 2;
      } else {
        expressions.push({ expression: text.slice(i + 2, close).trim(), display: true, line: lineAt(i) });
        i = close + 2;
      }
    } else {
      const close = closingInline(text, i + 1);
      if (close === -1) {
        i += 1;
      } else {
        expressions.push({ expression: text.slice(i + 1, close), display: false, line: lineAt(i) });
        i = close + 1;
      }
    }
  }
  return { expressions, unclosed };
}

/**
 * Why KaTeX rejects an expression, or undefined when it parses. Each expression is parsed on
 * its own, so a macro defined in one is not available to the next — as in a Page, where an
 * expression can be rendered alone.
 */
export function katexRejection({ expression, display }) {
  try {
    katex.renderToString(expression, { displayMode: display, throwOnError: true, strict: "ignore", macros: {} });
    return undefined;
  } catch (error) {
    // Only a parse error is a verdict about the Note; anything else is a bug and surfaces.
    if (!(error instanceof katex.ParseError)) throw error;
    return error.rawMessage;
  }
}

/** Where the `$$` closing a display block starting at `from` begins, or -1. */
function closingDisplay(text, from) {
  for (let j = from; j < text.length; j += 1) {
    if (text[j] === "\\") j += 1;
    else if (text[j] === "$" && text[j + 1] === "$") return j;
  }
  return -1;
}

/** Whether the newline at `j` is followed by a blank line, which ends a paragraph. */
function startsBlankLine(text, j) {
  const blankLine = /\n[ \t]*(?:\n|$)/y;
  blankLine.lastIndex = j;
  return blankLine.test(text);
}

/** Where the `$` closing an inline expression starting at `from` is, or -1. */
function closingInline(text, from) {
  if (from >= text.length || /\s/.test(text[from])) return -1;
  for (let j = from; j < text.length; j += 1) {
    if (text[j] === "\\") {
      j += 1;
    } else if (text[j] === "\n" && startsBlankLine(text, j)) {
      return -1;
    } else if (text[j] === "$" && j > from && !/\s/.test(text[j - 1]) && !/[0-9]/.test(text[j + 1] ?? "")) {
      return j;
    }
  }
  return -1;
}

/**
 * The body with fenced code blocks, code spans and comments blanked out — every character but
 * a newline turned into a space, so positions and line numbers are unchanged.
 */
function maskCode(body) {
  return maskInline(maskFences(body));
}

const blank = (text) => text.replace(/[^\n]/g, " ");

function maskFences(body) {
  const lines = body.split("\n");
  let fence = null;
  for (let index = 0; index < lines.length; index += 1) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(lines[index])?.[1];
    if (fence === null) {
      if (marker === undefined) continue;
      fence = marker;
    } else if (marker !== undefined && marker[0] === fence[0] && marker.length >= fence.length && lines[index].trim() === marker) {
      fence = null;
    }
    lines[index] = blank(lines[index]);
  }
  return lines.join("\n");
}

/**
 * Code spans, HTML comments and `%%` comments, in one pass so that whichever opens first
 * wins. A run of n backticks opens a code span closed by the next run of exactly n within the
 * paragraph; a comment that is never closed is left as prose, so its mathematics is checked.
 */
function maskInline(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const end = inlineEnd(text, i);
    if (end === -1) {
      // An escape is copied whole, so `\$` and an escaped backtick stay literal.
      const length = text[i] === "\\" ? 2 : 1;
      out += text.slice(i, i + length);
      i += length;
    } else {
      out += blank(text.slice(i, end));
      i = end;
    }
  }
  return out;
}

/** Where a code span or comment opening at `i` ends, or -1 when none opens there. */
function inlineEnd(text, i) {
  for (const [open, close] of [["<!--", "-->"], ["%%", "%%"]]) {
    if (!text.startsWith(open, i)) continue;
    const at = text.indexOf(close, i + open.length);
    return at === -1 ? -1 : at + close.length;
  }
  if (text[i] !== "`" || text[i - 1] === "`") return -1;
  const run = /`+/y;
  run.lastIndex = i;
  const ticks = run.exec(text)[0];
  const closing = new RegExp(`(?<!\`)${ticks}(?!\`)`, "g");
  closing.lastIndex = i + ticks.length;
  const found = closing.exec(text);
  if (!found || BLANK_LINE_ANYWHERE.test(text.slice(i, found.index))) return -1;
  return found.index + ticks.length;
}

const BLANK_LINE_ANYWHERE = /\n[ \t]*\n/;

function countNewlines(text, end) {
  let count = 0;
  for (let i = 0; i < end; i += 1) if (text[i] === "\n") count += 1;
  return count;
}
