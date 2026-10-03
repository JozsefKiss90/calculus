#!/usr/bin/env node
// The one entry point for the Wiki production tooling. Subcommands take the vault
// directory as an argument, so each of them is testable against a fixture vault in a
// temporary directory.
//
//   node scripts/wiki.js check <vault directory>
//   node scripts/wiki.js scaffold <vault directory> [<Node name>...]
//   node scripts/wiki.js generate <vault directory>
//
// Exit codes: 0 every invariant holds and no metric is red, every Note asked for exists, or
// every generated block is written; 1 the check ran and something failed or graded red, or
// some Notes' blocks could not be written; 2 nothing could run at all — bad usage, no Anchor Graph, a graph that cannot
// be read, an Archetype catalogue or Floor plausibility judgements that cannot be read, or a
// scaffold that was refused.

import { AnchorGraphError, loadAnchorGraph } from "./lib/anchor-graph.js";
import { CatalogueError, loadCatalogue } from "./lib/archetype-catalogue.js";
import { FloorJudgementError, loadFloorJudgements } from "./lib/floor-judgements.js";
import { GraphError, graphShape } from "./lib/graph.js";
import { checkStructuralInvariants } from "./lib/structural-invariants.js";
import { checkNoteInvariants } from "./lib/note-invariants.js";
import { computeMetrics } from "./lib/metrics.js";
import { checkRawStore, loadRawStore } from "./lib/raw-store.js";
import { isConcept, loadNotes, vaultFiles } from "./lib/notes.js";
import { buildErrorReport, buildReport, writeReport } from "./lib/report.js";
import { renderSummary } from "./lib/summary.js";
import { ScaffoldError, scaffold } from "./lib/scaffold.js";
import { generate } from "./lib/generate.js";

// Module 1's Terminal Node: the declaration invariant 2 holds the graph against. A Module
// has exactly one, and this is where this Module's is declared.
const TERMINAL_NODE = "Derivative";

// Where each Note goes. The Anchor Graph's subgraphs are its domains, but their ids are
// short keys and their labels are prose, so neither is a directory name; this is the one
// place the two are tied together. The Terminal Node sits outside every subgraph and has
// a domain of its own. A subgraph missing from this table is refused, never guessed at.
const DOMAINS = {
  ALG: "algebra",
  FUN: "functions",
  LIM: "limits",
  TRIG: "trigonometry",
};
const TERMINAL_DOMAIN = "calculus";

const USAGE = `usage: node scripts/wiki.js <subcommand>

subcommands:
  check <vault directory>   check the Wiki's invariants against the declared Terminal
                            Node "${TERMINAL_NODE}" and grade its metrics, write the
                            report to .wiki-health/report.json beside the vault, print a
                            summary, and exit non-zero on any failure or red metric
  scaffold <vault directory> [<Node name>...]
                            create the stub Note for every Node in the Anchor Graph, or
                            only the Nodes named; a Note that already exists is never
                            touched, and a Node the Anchor Graph lacks is refused
  generate <vault directory>
                            rewrite every concept Note's generated blocks (Builds on,
                            Required by and the prerequisite mini-map) from the Notes'
                            requires; nothing outside the markers is touched, and a hand
                            edit inside them is overwritten
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
  if (!["check", "scaffold", "generate"].includes(subcommand)) {
    return usageError(`unknown subcommand "${subcommand}"\n\n${USAGE}`);
  }

  const option = rest.find((arg) => arg.startsWith("-"));
  if (option) return usageError(`${subcommand} takes no options, given "${option}"\n\n${USAGE}`);
  if (rest.length === 0) return usageError(`${subcommand} needs a vault directory\n\n${USAGE}`);

  if (subcommand === "scaffold") return scaffoldNotes(rest[0], rest.slice(1));
  if (rest.length > 1) {
    return usageError(`${subcommand} takes one vault directory, given ${rest.length}\n\n${USAGE}`);
  }
  return subcommand === "check" ? check(rest[0]) : generateBlocks(rest[0]);
}

async function check(vaultDir) {
  let loaded;
  let catalogue;
  let judgements;
  try {
    loaded = await loadAnchorGraph(vaultDir);
    catalogue = await loadCatalogue();
    judgements = await loadFloorJudgements(vaultDir);
  } catch (error) {
    // Only a graph, an Archetype catalogue or a judgements file that cannot be read is a
    // report; anything else is a bug in this tool and should surface as one rather than as a
    // verdict about the Wiki.
    const unreadable = [AnchorGraphError, GraphError, CatalogueError, FloorJudgementError];
    if (!unreadable.some((kind) => error instanceof kind)) throw error;
    return await reportUnrunnable(vaultDir, error);
  }

  const { note, graph } = loaded;
  const notes = await loadNotes(vaultDir);
  const report = buildReport({
    vaultDir,
    graph: { source: "anchor", note, ...graphShape(graph, TERMINAL_NODE) },
    notes: { notes: notes.length, conceptNotes: notes.filter(isConcept).length },
    invariants: [
      ...checkStructuralInvariants(graph, { terminalNode: TERMINAL_NODE }),
      ...checkNoteInvariants(notes, loaded, catalogue),
      checkRawStore(notes, await loadRawStore(vaultDir)),
    ],
    metrics: computeMetrics(notes, { files: await vaultFiles(vaultDir), today: localDate(), judgements }),
  });

  const reportPath = await writeReport(vaultDir, report);
  process.stdout.write(renderSummary(report, reportPath));
  return report.status === "pass" ? EXIT_OK : EXIT_FAILED;
}

async function scaffoldNotes(vaultDir, nodeNames) {
  let result;
  try {
    const anchor = await loadAnchorGraph(vaultDir);
    refuseBrokenGraph(anchor.graph);
    result = await scaffold(vaultDir, anchor, {
      terminalNode: TERMINAL_NODE,
      terminalDomain: TERMINAL_DOMAIN,
      domains: DOMAINS,
      nodeNames,
      today: localDate(),
    });
  } catch (error) {
    const refusal = [AnchorGraphError, GraphError, ScaffoldError].some((kind) => error instanceof kind);
    if (!refusal) throw error;
    process.stderr.write(`scaffold refused, and wrote nothing:\n${error.message}\n`);
    return EXIT_UNRUNNABLE;
  }

  const { created, present } = result;
  const notes = (count) => `${count} ${count === 1 ? "Note" : "Notes"}`;
  const lines = created.map((path) => `created ${path}`);
  for (const { path, expected } of present) {
    if (path !== expected) lines.push(`left in place: ${path}, though the Anchor Graph puts it in ${expected}`);
  }
  lines.push(
    created.length === 0
      ? `no change: all ${notes(present.length)} already exist`
      : `created ${notes(created.length)}, ${present.length} already present`,
  );
  process.stdout.write(`${lines.join("\n")}\n`);
  return EXIT_OK;
}

async function generateBlocks(vaultDir) {
  let result;
  try {
    result = await generate(vaultDir, await loadNotes(vaultDir));
  } catch (error) {
    // A graph the Notes cannot form, or a vault that is not there; anything else is a bug.
    if (!(error instanceof GraphError || ["ENOENT", "ENOTDIR"].includes(error.code))) throw error;
    process.stderr.write(`generate could not run, and wrote nothing:\n${error.message}\n`);
    return EXIT_UNRUNNABLE;
  }

  const { updated, unchanged, refused } = result;
  const notes = (count) => `${count} ${count === 1 ? "Note" : "Notes"}`;
  const lines = updated.map((path) => `updated ${path}`);
  for (const { path, problems } of refused) {
    lines.push(`left alone ${path}:`, ...problems.map((problem) => `  ${problem}`));
  }
  const leftAlone = refused.length === 0 ? "" : `, ${refused.length} left alone`;
  lines.push(
    updated.length === 0 && refused.length === 0
      ? `no change: all ${notes(unchanged.length)} already up to date`
      : `updated ${notes(updated.length)}, ${unchanged.length} already up to date${leftAlone}`,
  );
  process.stdout.write(`${lines.join("\n")}\n`);
  return refused.length === 0 ? EXIT_OK : EXIT_FAILED;
}

/**
 * Scaffolding a graph `check` would fail writes structure nobody reviewed into the vault,
 * so the structural invariants gate this too.
 */
function refuseBrokenGraph(graph) {
  const broken = checkStructuralInvariants(graph, { terminalNode: TERMINAL_NODE }).filter(
    (invariant) => invariant.status === "fail",
  );
  if (broken.length === 0) return;
  throw new ScaffoldError(
    broken
      .flatMap((invariant) => [
        `invariant ${invariant.id} fails: ${invariant.title}`,
        ...invariant.failures.map((failure) => `  ${failure.message}`),
      ])
      .join("\n"),
  );
}

/** Today in the author's own time zone, which is the date a human would write. */
function localDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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
