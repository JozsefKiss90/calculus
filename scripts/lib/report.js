// The machine-readable report: the one thing the pipeline gates on.
//
// It is a JSON file outside the vault rather than a Dataview query inside it, because a
// query only materialises when a human opens Obsidian, which makes it invisible to every
// agent it is meant to govern (ADR-0002). The Dataview dashboard added in 17 mirrors this
// file; it never computes anything of its own.
//
// The path is fixed: `.wiki-health/report.json` beside the vault directory, so `cat
// .wiki-health/report.json` from the repo root reads the last run's result.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const REPORT_DIRECTORY = ".wiki-health";
const REPORT_FILE = "report.json";

/** Where `check` writes the report for a given vault directory. */
function reportPathFor(vaultDir) {
  return join(dirname(resolve(vaultDir)), REPORT_DIRECTORY, REPORT_FILE);
}

export async function writeReport(vaultDir, report) {
  const path = reportPathFor(vaultDir);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return path;
}

export function buildReport({ vaultDir, graph, notes, invariants }) {
  const failed = invariants.filter((entry) => entry.status === "fail");
  const checked = invariants.filter((entry) => entry.status !== "skipped");

  return {
    generatedAt: new Date().toISOString(),
    vault: resolve(vaultDir),
    status: failed.length === 0 ? "pass" : "fail",
    graph,
    notes,
    invariants,
    summary: {
      invariantsChecked: checked.length,
      invariantsFailed: failed.length,
    },
  };
}

/** A report for a run that could not get as far as checking anything. */
export function buildErrorReport({ vaultDir, message }) {
  return {
    generatedAt: new Date().toISOString(),
    vault: resolve(vaultDir),
    status: "error",
    error: message,
    graph: null,
    notes: null,
    invariants: [],
    summary: { invariantsChecked: 0, invariantsFailed: 0 },
  };
}
