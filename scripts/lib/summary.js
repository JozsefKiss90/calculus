// The human summary printed beside the machine-readable report.
//
// Everything here is rendered from the report, never computed again, so the line a human
// reads and the field an agent gates on cannot disagree — the same reason 17's dashboard
// is generated from the report rather than maintained (ADR-0002).

const counted = (count, singular, pluralForm = `${singular}s`) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

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

  const { invariantsChecked, invariantsFailed } = report.summary;
  const skipped = report.invariants.length - invariantsChecked;
  const notChecked = skipped === 0 ? "" : `, ${skipped} not checked`;
  lines.push(
    "",
    report.status === "pass"
      ? `check passed: ${invariantsChecked} of ${invariantsChecked} invariants hold${notChecked}`
      : `check failed: ${counted(invariantsFailed, "invariant")} of ${invariantsChecked} broken${notChecked}`,
    `report: ${reportPath}`,
  );

  return `${lines.join("\n")}\n`;
}
