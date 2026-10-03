// The recorded Floor plausibility judgements: one file, written by a human, read by `check`.
//
// Whether a Floor Note's content is above 8th grade is a review judgement, not something a
// script can see, so nothing here infers one. `check` lists every Floor Note, a human writes
// a verdict for each into this file, and the metric grades what is written.
//
// The file is `observability/Floor Plausibility.md` in the vault. It has no frontmatter, so
// it is not a Note, and it sits beside the generated dashboard rather than in any Note's
// frontmatter, so judging a Floor Note never touches the Note. Its Note column holds
// wikilinks, so Obsidian keeps them pointing at the right Note through a rename.
//
// The judgements are the first table whose header is `Note | Verdict | Reason`:
//
//   | Note | Verdict | Reason |
//   |---|---|---|
//   | [[Factors and multiples]] | plausible | |
//   | [[Some Floor Note]] | flagged | Needs the quadratic formula, which is beyond 8th grade. |
//
// A Verdict is `plausible` or `flagged`, and a flagged row gives its Reason. A `|` inside a
// Reason is written `\|`, as in any Obsidian table. A file this cannot read in full is
// refused, never read in part, because a misread verdict grades a Floor Note it was never
// given. A missing file is no judgements at all: every Floor Note is unjudged.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { linkTarget } from "./notes.js";

export const FLOOR_JUDGEMENTS_PATH = "observability/Floor Plausibility.md";

export const VERDICTS = ["plausible", "flagged"];

const HEADER = ["note", "verdict", "reason"];

export class FloorJudgementError extends Error {
  constructor(message) {
    super(`${FLOOR_JUDGEMENTS_PATH} cannot be used: ${message}`);
    this.name = "FloorJudgementError";
  }
}

/**
 * @typedef {{note: string, verdict: "plausible" | "flagged", reason: string, line: number}} Judgement
 * @returns {Promise<Judgement[]>}
 * @throws {FloorJudgementError}
 */
export async function loadFloorJudgements(vaultDir) {
  let text;
  try {
    text = await readFile(join(vaultDir, FLOOR_JUDGEMENTS_PATH), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  return parseFloorJudgements(text);
}

/**
 * @param {string} text the file's markdown
 * @returns {Judgement[]}
 * @throws {FloorJudgementError}
 */
export function parseFloorJudgements(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex(
    (line, i) =>
      isRow(line) &&
      cellsOf(line).map((cell) => cell.toLowerCase()).join("|") === HEADER.join("|") &&
      isSeparator(lines[i + 1] ?? ""),
  );
  if (start === -1) throw new FloorJudgementError("it has no table with the columns Note, Verdict and Reason");

  const judgements = [];
  const seen = new Map();
  for (let i = start + 2; i < lines.length && isRow(lines[i]); i += 1) {
    const line = i + 1;
    const cells = cellsOf(lines[i]);
    if (cells.every((cell) => cell === "")) continue;
    const at = `line ${line}`;
    if (cells.length !== HEADER.length) {
      throw new FloorJudgementError(`${at} has ${cells.length} cells, not Note, Verdict and Reason`);
    }

    const [noteCell, verdictCell, reason] = cells;
    const link = /^\[\[([^\]|]+)\]\]$/.exec(noteCell);
    if (!link) throw new FloorJudgementError(`${at}: the Note "${noteCell}" is not a single wikilink such as [[Note name]]`);
    const note = linkTarget(link[1]);
    if (note === "") throw new FloorJudgementError(`${at}: the Note "${noteCell}" names no Note`);

    const verdict = verdictCell.toLowerCase();
    if (!VERDICTS.includes(verdict)) {
      throw new FloorJudgementError(`${at}: the Verdict "${verdictCell}" is not ${VERDICTS.join(" or ")}`);
    }
    if (verdict === "flagged" && reason === "") {
      throw new FloorJudgementError(`${at}: [[${note}]] is flagged with no Reason`);
    }

    const key = note.toLowerCase();
    if (seen.has(key)) {
      throw new FloorJudgementError(`${at}: [[${note}]] is judged twice, here and on line ${seen.get(key)}`);
    }
    seen.set(key, line);
    judgements.push({ note, verdict, reason, line });
  }
  return judgements;
}

const isRow = (line) => line.trim().startsWith("|");

const isSeparator = (line) => isRow(line) && cellsOf(line).every((cell) => /^:?-+:?$/.test(cell));

/** A table row's cells, split on every `|` that is not escaped, with `\|` read as `|`. */
function cellsOf(line) {
  const cells = line
    .trim()
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));
  // The leading and trailing pipes leave an empty cell at each end.
  if (cells[0] === "") cells.shift();
  if (cells.at(-1) === "" && line.trim().endsWith("|") && !line.trim().endsWith("\\|")) cells.pop();
  return cells;
}
