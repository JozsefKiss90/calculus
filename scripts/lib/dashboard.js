// The Graph Health Dashboard: the report, rendered into the vault for a human reading it in
// Obsidian. Every number on it is a field of the report `check` gates on, copied and never
// recomputed (ADR-0002); a Dataview query at the foot is a live view for authoring between
// runs, and decides nothing.
//
// It is an `observability` Note, so it carries frontmatter and is held to every invariant a
// Note is. Its body is escaped text and links to Notes that exist, so it never adds a broken
// link, a maths expression or an Interactive of its own to the report it mirrors.

import { escapeText, counted } from "./markdown-text.js";
import { measureOf, tally } from "./summary.js";

export const DASHBOARD_PATH = "observability/Graph Health Dashboard.md";

const SENTENCE =
  "The Wiki's health as `npm run check` computes it, written here by `npm run generate` so this page and the build gate cannot disagree.";

/**
 * The dashboard's frontmatter and opening, which never depend on the report: what the
 * dashboard is as a Note, before anything is written into it.
 *
 * @param {{created: string, updated: string}} dates
 */
export function dashboardShell({ created, updated }) {
  return `---
kind: observability
domain: observability
requires: []
status: drafted
reviewed_by: none
created: ${created}
updated: ${updated}
---
# Graph Health Dashboard

## In one sentence

${SENTENCE}

> [!info] Generated
> Every number on this page is copied from the computation \`npm run check\` gates on, which writes the same numbers to \`.wiki-health/report.json\` beside the vault. \`npm run generate\` rewrites this page, so a hand edit is lost on the next run.
`;
}

/**
 * The whole dashboard for a report.
 *
 * @param {object} report what `assessHealth` returned
 * @param {{created: string, updated: string}} dates
 * @param {(path: string) => string | undefined} linkTo a wikilink to the Note at a path, or
 *   undefined when no Note is there
 */
export function renderDashboard(report, dates, linkTo) {
  const sections = [dashboardShell(dates).trimEnd()];
  if (report.status === "error") {
    sections.push("## Verdict", `**check cannot run**: ${escapeText(report.error)}`);
  } else {
    sections.push(
      "## Verdict",
      `**check ${report.status === "pass" ? "passes" : "fails"}**: ${escapeText(tally(report))}.`,
      "## The Module at a glance",
      ...glance(report.progress),
      "## The graph",
      graphLine(report),
      "## Invariants",
      ...invariants(report.invariants),
      "## Metrics",
      ...metrics(report.metrics, linkTo),
    );
  }
  sections.push("## Live view", ...liveView());
  return `${sections.join("\n\n")}\n`;
}

function glance(progress) {
  const row = (cells) => `| ${cells.join(" | ")} |`;
  const { conceptNotes, status, reviewedBy, layers } = progress;
  const lines = [
    row(["Layer", "Notes", "Stub", "Drafted", "Reviewed"]),
    row(["---:", "---:", "---:", "---:", "---:"]),
    ...layers.map(({ layer, notes, stub, drafted, reviewed }) => row([layer, notes, stub, drafted, reviewed])),
    row(["**All**", `**${conceptNotes}**`, `**${status.stub}**`, `**${status.drafted}**`, `**${status.reviewed}**`]),
  ];
  const waiting = `${counted(reviewedBy.agent, "Note is", "Notes are")} reviewed by an agent and ${reviewedBy.agent === 1 ? "waits" : "wait"} for human sign-off.`;
  const signedOff = `${counted(reviewedBy.human, "Note is", "Notes are")} signed off by a human.`;
  return [lines.join("\n"), `${waiting} ${signedOff}`];
}

function graphLine({ graph, notes }) {
  return [
    `${counted(graph.nodes, "Node")}, ${counted(graph.edges, "Edge")} and ${counted(graph.floorNodes, "Floor Node")} in the Anchor Graph; ${graph.reachableNodes} of ${graph.nodes} Nodes reachable from the declared Terminal Node, ${escapeText(graph.declaredTerminalNode)}.`,
    `${counted(notes.notes, "Note")} with frontmatter, ${notes.conceptNotes} of them concept Notes.`,
  ].join(" ");
}

function invariants(entries) {
  const table = [
    "| # | Invariant | Result | Failures |",
    "|---:|---|---|---:|",
    ...entries.map(
      (invariant) => `| ${invariant.id} | ${escapeText(invariant.title)} | ${invariant.status} | ${invariant.failures.length} |`,
    ),
  ];
  const out = [table.join("\n")];
  for (const invariant of entries) {
    if (invariant.reason) out.push(`Invariant ${invariant.id} was not checked: ${escapeText(invariant.reason)}`);
    if (invariant.failures.length === 0) continue;
    out.push(
      `### Invariant ${invariant.id} fails\n\n${invariant.failures.map((failure) => `- ${escapeText(failure.message)}`).join("\n")}`,
    );
  }
  return out;
}

function metrics(entries, linkTo) {
  const table = [
    "| Metric | Level | Measure | Green | Yellow | Red |",
    "|---|---|---|---|---|---|",
    ...entries.map((metric) => {
      const cells = [metric.title, metric.level, measureOf(metric), metric.bands.green, metric.bands.yellow, metric.bands.red];
      return `| ${cells.map(escapeText).join(" | ")} |`;
    }),
  ];
  const out = [table.join("\n")];
  for (const metric of entries) {
    const lines = [];
    if (metric.reason) lines.push(`Not measured: ${escapeText(metric.reason)}`);
    if (metric.judged) {
      const { floorNotes, plausible, flagged, unjudged } = metric.judged;
      lines.push(`${counted(floorNotes, "Floor Note")}: ${plausible} plausible, ${flagged} flagged, ${unjudged} unjudged.`);
    }
    // Work waiting on a human is shown at every level, since it is not graded.
    const pending = [...(metric.unjudged ?? []), ...(metric.stale ?? [])];
    if (pending.length > 0) lines.push(pending.map((entry) => item(entry, linkTo)).join("\n"));
    if (metric.level === "yellow" || metric.level === "red") {
      lines.push(`**Action:** ${escapeText(metric.action)}`);
      if (metric.notes.length > 0) lines.push(metric.notes.map((entry) => item(entry, linkTo)).join("\n"));
    }
    if (lines.length > 0) out.push(`### ${escapeText(metric.title)}: ${metric.level}`, ...lines);
  }
  return out;
}

/**
 * One listed Note: a link to it, then what the report says about it. The report's message
 * leads with the Note's path, which the link replaces.
 */
function item(entry, linkTo) {
  const link = entry.note === undefined ? undefined : linkTo(entry.note);
  if (link === undefined) return `- ${escapeText(entry.message)}`;
  const prefix = `${entry.note}: `;
  const rest = entry.message.startsWith(prefix) ? entry.message.slice(prefix.length) : entry.message;
  return `- ${link}: ${escapeText(rest)}`;
}

function liveView() {
  return [
    "Live, for authoring between runs: Dataview reads the frontmatter as it is now. The tables above are the authority, and are only as fresh as the last `npm run generate`.",
    [
      "```dataview",
      'TABLE WITHOUT ID file.link AS Note, status, reviewed_by, updated',
      'FROM ""',
      'WHERE kind = "concept" AND status != "reviewed"',
      "SORT status DESC, updated ASC",
      "```",
    ].join("\n"),
  ];
}
