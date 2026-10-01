#!/usr/bin/env node
// The one entry point for the Wiki production tooling. Subcommands take the vault
// directory as an argument, so each of them is testable against a fixture vault in a
// temporary directory.
//
//   node scripts/wiki.js check <vault directory>
//
// Exit codes: 0 every invariant holds, 1 the check ran and something failed, 2 the check
// could not run at all — bad usage, no Anchor Graph, or a graph that cannot be read.

import { AnchorGraphError, loadAnchorGraph } from "./lib/anchor-graph.js";
import { GraphError, graphShape } from "./lib/graph.js";
import { checkStructuralInvariants } from "./lib/structural-invariants.js";
import { buildErrorReport, buildReport, writeReport } from "./lib/report.js";
import { renderSummary } from "./lib/summary.js";

// Module 1's Terminal Node: the declaration invariant 2 holds the graph against. A Module
// has exactly one, and this is where this Module's is declared.
const TERMINAL_NODE = "Derivative";

const USAGE = `usage: node scripts/wiki.js <subcommand>

subcommands:
  check <vault directory>   check the Wiki's invariants against the declared Terminal
                            Node "${TERMINAL_NODE}", write the report to
                            .wiki-health/report.json beside the vault, print a summary,
                            and exit non-zero on any failure
`;

const EXIT_OK = 0;
const EXIT_FAILED = 1;
const EXIT_UNRUNNABLE = 2;

async function main(argv) {
  const [subcommand, ...rest] = argv;

  if (subcommand === "--help" || subcommand === "-h") {
    process.stdout.write(USAGE);
    return EXIT_OK;
  }
  if (!subcommand) return usageError(USAGE);
  if (subcommand !== "check") return usageError(`unknown subcommand "${subcommand}"\n\n${USAGE}`);

  const option = rest.find((arg) => arg.startsWith("-"));
  if (option) return usageError(`check takes no options, given "${option}"\n\n${USAGE}`);
  if (rest.length === 0) return usageError(`check needs a vault directory\n\n${USAGE}`);
  if (rest.length > 1) {
    return usageError(`check takes one vault directory, given ${rest.length}\n\n${USAGE}`);
  }

  return check(rest[0]);
}

async function check(vaultDir) {
  let loaded;
  try {
    loaded = await loadAnchorGraph(vaultDir);
  } catch (error) {
    // Only a graph that cannot be read is a report; anything else is a bug in this tool
    // and should surface as one rather than as a verdict about the Wiki.
    if (!(error instanceof AnchorGraphError || error instanceof GraphError)) throw error;
    return await reportUnrunnable(vaultDir, error);
  }

  const { note, graph } = loaded;
  const report = buildReport({
    vaultDir,
    graph: { source: "anchor", note, ...graphShape(graph, TERMINAL_NODE) },
    invariants: checkStructuralInvariants(graph, { terminalNode: TERMINAL_NODE }),
  });

  const reportPath = await writeReport(vaultDir, report);
  process.stdout.write(renderSummary(report, reportPath));
  return report.status === "pass" ? EXIT_OK : EXIT_FAILED;
}

/**
 * A run that could not reach the invariants still leaves a report behind, so the pipeline
 * reads one answer whatever went wrong.
 */
async function reportUnrunnable(vaultDir, error) {
  const report = buildErrorReport({ vaultDir, message: error.message });
  try {
    await writeReport(vaultDir, report);
  } catch {
    // The report is beside the vault; if that directory is unwritable, the message on
    // stderr is all there is, and the exit code still gates the build.
  }
  process.stderr.write(`${error.message}\n`);
  return EXIT_UNRUNNABLE;
}

function usageError(message) {
  process.stderr.write(`${message}\n`);
  return EXIT_UNRUNNABLE;
}

process.exitCode = await main(process.argv.slice(2));
