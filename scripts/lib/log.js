// `log.md`: the record of what the pipeline did, written by `generate` and never by hand.
//
// Each entry records one run that changed something: the date, the Layers it touched, every
// Note whose `status` or `reviewed_by` moved, and the report's verdict and metric levels at
// the time. A run that changed nothing appends nothing, so a second run on an unchanged vault
// leaves the log byte-identical. Earlier entries are never rewritten. Because a run compares
// against the last recorded state, a Note that moves and moves back between two runs is never
// logged: the log records what each run found, not every edit in between.
//
// To know what moved, the log keeps the state its last entry recorded in an HTML comment at
// its foot, invisible in Obsidian's reading view. The next run compares the vault against it.
// A log with no readable state — the first run, or one damaged by hand — gets an entry that
// records where the Module stands instead of what moved.
//
// The log has no frontmatter, so it is not a Note and no graph computation reads it.

import { counted, escapeText } from "./markdown-text.js";

export const LOG_PATH = "log.md";

const HEADER = `# Log

What the pipeline did, one entry per \`npm run generate\` run that changed something: the Layers it touched, the Notes that moved state, and what the health report said at the time. Written by \`generate\`; never edit it by hand.
`;

const STATE_OPEN = "<!-- log-state: what the last entry recorded, which the next generate run compares against. Written by generate; never edit by hand.";
const STATE_CLOSE = "-->";

/**
 * @typedef {{path: string, name: string, layer: number | undefined, status: string, reviewedBy: string}} NoteState
 */

/**
 * The log after this run: the existing log, with one entry appended when anything changed.
 *
 * @param {string | undefined} existing the log as it is, or undefined when there is none
 * @param {object} run
 * @param {object} run.report what `assessHealth` returned
 * @param {NoteState[]} run.notes every concept Note's state now
 * @param {string} run.today the date of the run, as YYYY-MM-DD
 * @param {{layer: number, nodes: number}} [run.packs] the Layer whose Context Packs this run wrote
 * @returns {string}
 */
export function nextLog(existing, { report, notes, today, packs }) {
  const text = existing ?? HEADER;
  const previous = readState(text);
  const state = stateOf(report, notes);

  const moved = previous === undefined ? [] : transitions(previous.notes, notes);
  const healthChanged = previous === undefined || JSON.stringify(previous.health) !== JSON.stringify(state.health);
  if (previous !== undefined && moved.length === 0 && !healthChanged && packs === undefined) return text;

  const entry = renderEntry({ first: previous === undefined, moved, report, today, packs });
  return `${withoutState(text).trimEnd()}\n\n${entry}\n\n${renderState(state)}\n`;
}

/** The state an entry records: each concept Note's status and reviewer, and the report's levels. */
function stateOf(report, notes) {
  return {
    notes: Object.fromEntries(notes.map((note) => [note.path, `${note.status}/${note.reviewedBy}`])),
    health: {
      status: report.status,
      metrics: Object.fromEntries(report.metrics.map((metric) => [metric.id, metric.level])),
    },
  };
}

/** Every Note whose state differs from the recorded one, a Note added or removed included. */
function transitions(recorded, notes) {
  const now = new Map(notes.map((note) => [note.path, note]));
  const moved = [];
  for (const note of notes) {
    const was = recorded[note.path];
    const is = `${note.status}/${note.reviewedBy}`;
    if (was !== is) moved.push({ name: note.name, link: true, layer: note.layer, was, is });
  }
  for (const [path, was] of Object.entries(recorded)) {
    if (now.has(path)) continue;
    moved.push({ name: path.split("/").at(-1).replace(/\.md$/, ""), link: false, layer: undefined, was, is: undefined });
  }
  return moved.sort((a, b) => (a.layer ?? Infinity) - (b.layer ?? Infinity) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function renderEntry({ first, moved, report, today, packs }) {
  const layers = [...new Set([...moved.map((entry) => entry.layer), packs?.layer].filter((layer) => layer !== undefined))].sort(
    (a, b) => a - b,
  );
  const named = `${layers.length === 1 ? "Layer" : "Layers"} ${listed(layers)}`;
  const touched = first ? (layers.length === 0 ? "first entry" : `first entry · ${named}`) : layers.length === 0 ? "no Layer" : named;
  const lines = [`## ${today} · ${touched}`];

  if (packs !== undefined) lines.push(`Context Packs written for Layer ${packs.layer}: ${counted(packs.nodes, "Node")}.`);
  if (first) {
    lines.push("No earlier state is recorded, so this entry records where the Module stands rather than what moved.");
  } else if (moved.length === 0) {
    lines.push("No Note moved state.");
  } else {
    lines.push(
      `${counted(moved.length, "Note")} moved state:`,
      [
        "| Note | Layer | Was | Now |",
        "|---|---:|---|---|",
        ...moved.map(
          ({ name, link, layer, was, is }) =>
            `| ${link ? `[[${name}]]` : escapeText(name)} | ${layer ?? "—"} | ${stateLabel(was, "new")} | ${stateLabel(is, "removed")} |`,
        ),
      ].join("\n"),
    );
  }

  if (report.status === "error") {
    lines.push(`Health: check cannot run: ${escapeText(report.error)}`);
  } else {
    const { conceptNotes, status } = report.progress;
    lines.push(
      `${counted(conceptNotes, "concept Note")}: ${status.stub} stub, ${status.drafted} drafted, ${status.reviewed} reviewed.`,
      `Health: check ${report.status === "pass" ? "passes" : "fails"}.`,
      report.metrics.map((metric) => `- ${escapeText(metric.title)}: ${metric.level}`).join("\n"),
    );
  }
  return lines.join("\n\n");
}

/** `stub`, or `drafted, reviewed by agent`; `absent` when the Note was not there. */
function stateLabel(state, absent) {
  if (state === undefined) return absent;
  const [status, reviewedBy] = state.split("/");
  return reviewedBy === "none" ? status : `${status}, reviewed by ${reviewedBy}`;
}

const listed = (items) => (items.length === 1 ? String(items[0]) : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);

function renderState(state) {
  // `>` is escaped inside the JSON's strings, so nothing in it can close the comment early.
  return `${STATE_OPEN}\n${JSON.stringify(state, null, 2).replace(/>/g, "\\u003e")}\n${STATE_CLOSE}`;
}

/** The recorded state, or undefined when there is none or it cannot be read. */
function readState(text) {
  const at = text.lastIndexOf(STATE_OPEN);
  if (at === -1) return undefined;
  const close = text.indexOf(STATE_CLOSE, at + STATE_OPEN.length);
  if (close === -1) return undefined;
  try {
    const state = JSON.parse(text.slice(at + STATE_OPEN.length, close));
    return typeof state?.notes === "object" && typeof state?.health === "object" ? state : undefined;
  } catch {
    return undefined;
  }
}

function withoutState(text) {
  const at = text.lastIndexOf(STATE_OPEN);
  return at === -1 ? text : text.slice(0, at);
}
