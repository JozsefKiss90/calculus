// The human summary printed beside the machine-readable report.
//
// Everything here is rendered from the report, never computed again, so the line a human
// reads and the field an agent gates on cannot disagree — the same reason 17's dashboard
// is generated from the report rather than maintained (ADR-0002).

import { counted } from "./markdown-text.js";

/** A metric's value as one phrase, the same wherever it is shown. */
export const measureOf = (metric) => {
  if (metric.level === "skipped") return "not measured";
  if (metric.unit !== "percent") return String(metric.count);
  return `${metric.count} of ${counted(metric.of, "written Note")} (${metric.percent}%)`;
};

export function renderSummary(report, reportPath) {
  if (report.status === "error") return `check could not run: ${report.error}\n`;

  const { graph } = report;
  const lines = [
    `Anchor Graph: ${graph.note}`,
    `  ${counted(graph.nodes, "Node")}, ${counted(graph.edges, "Edge")}, ${counted(graph.floorNodes, "Floor Node")}`,
    `  Declared Terminal Node: ${graph.declaredTerminalNode}`,
    `  Nodes nothing requires: ${graph.nodesWithNoDependents.join(", ")}`,
    `  ${graph.reachableNodes} of ${graph.nodes} Nodes reachable from the Terminal Node`,
    `Notes: ${counted(report.notes.notes, "Note")} with frontmatter, ${report.notes.conceptNotes} of them concept Notes`,
    "",
    "Invariants",
  ];

  for (const invariant of report.invariants) {
    lines.push(`  ${invariant.status.toUpperCase().padEnd(8)}${String(invariant.id).padStart(2)}  ${invariant.title}`);
    if (invariant.reason) lines.push(`              not checked: ${invariant.reason}`);
    for (const failure of invariant.failures) lines.push(`              ${failure.message}`);
  }

  lines.push("", "Metrics");
  for (const metric of report.metrics) {
    const bands = Object.entries(metric.bands).map(([level, band]) => `${level} ${band}`).join(" · ");
    lines.push(`  ${metric.level.toUpperCase().padEnd(8)}${metric.title}: ${measureOf(metric)}  (${bands})`);
    if (metric.reason) lines.push(`              not measured: ${metric.reason}`);
    if (metric.judged) {
      const { floorNotes, plausible, flagged, unjudged } = metric.judged;
      lines.push(`              ${counted(floorNotes, "Floor Note")}: ${plausible} plausible, ${flagged} flagged, ${unjudged} unjudged`);
    }
    // Work waiting on a human is shown at every level, since it is not graded.
    for (const pending of [...(metric.unjudged ?? []), ...(metric.stale ?? [])]) {
      lines.push(`              ${pending.message}`);
    }
    // Green needs nothing done, so only a yellow or red metric spells out its action and Notes.
    if (metric.level !== "yellow" && metric.level !== "red") continue;
    lines.push(`              action: ${metric.action}`);
    for (const offender of metric.notes) lines.push(`              ${offender.message}`);
  }

  lines.push("", `check ${report.status === "pass" ? "passed" : "failed"}: ${tally(report)}`, `report: ${reportPath}`);

  return `${lines.join("\n")}\n`;
}

/** A report's invariants and metrics, counted in one line: shared by the summary and the dashboard. */
export function tally(report) {
  const { invariantsChecked, invariantsFailed, metrics } = report.summary;
  const skipped = report.invariants.length - invariantsChecked;
  const notChecked = skipped === 0 ? "" : `, ${skipped} not checked`;
  const invariants =
    invariantsFailed === 0
      ? `${invariantsChecked} of ${invariantsChecked} invariants hold${notChecked}`
      : `${counted(invariantsFailed, "invariant")} of ${invariantsChecked} broken${notChecked}`;
  const notMeasured = metrics.skipped === 0 ? "" : `, ${metrics.skipped} not measured`;
  const red = report.metrics.filter((metric) => metric.level === "red").map((metric) => metric.title);
  return `${invariants}; metrics ${metrics.green} green, ${metrics.yellow} yellow, ${metrics.red} red${notMeasured}${red.length === 0 ? "" : `: ${red.join(", ")}`}`;
}
