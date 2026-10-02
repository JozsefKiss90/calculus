// Test convention for this repo, established by ticket 02: build a fixture vault in a
// temporary directory, drive the CLI from outside it as a real child process, and assert
// only on what a user of the CLI can see — files written, report contents, exit code.
// Nothing is mocked and no test imports anything under `scripts/lib/`.

import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const CLI = fileURLToPath(new URL("../../scripts/wiki.js", import.meta.url));

const ANCHOR_NOTE_FRONTMATTER = `---
kind: reference
domain: wiki
requires: []
status: drafted
reviewed_by: none
created: 2026-10-01
updated: 2026-10-01
---
`;

/**
 * A fixture repository: an empty vault directory inside a throwaway parent directory that
 * stands in for the repo root.
 *
 * @returns {Promise<{root: string, vault: string}>}
 */
export async function makeFixtureRoot() {
  const root = await mkdtemp(join(tmpdir(), "calculus-fixture-"));
  const vault = join(root, "wiki");
  await mkdir(vault, { recursive: true });
  return { root, vault };
}

/**
 * An Anchor Graph Note whose mermaid block holds the given graph. Shared with the git-repo
 * fixture, so there is one definition of what a fixture Anchor Graph Note looks like.
 *
 * @param {string} mermaidBody the contents of the Note's mermaid block
 */
export function anchorNoteContents(mermaidBody) {
  const fence = "```";
  return `${ANCHOR_NOTE_FRONTMATTER}
## The graph

${fence}mermaid
${mermaidBody.trim()}
${fence}
`;
}

/**
 * A fixture repository holding an Anchor Graph Note whose mermaid block is the given graph.
 *
 * @param {string} mermaidBody the contents of the Note's mermaid block
 * @returns {Promise<{root: string, vault: string, anchorNote: string}>}
 */
export async function makeFixtureVault(mermaidBody) {
  return makeFixtureVaultFromNote(anchorNoteContents(mermaidBody));
}

/** A fixture repository whose Anchor Graph Note has exactly the given contents. */
export async function makeFixtureVaultFromNote(contents) {
  const { root, vault } = await makeFixtureRoot();
  const anchorNote = join(vault, "Module 1 Anchor Graph.md");
  await writeFile(anchorNote, contents, "utf8");
  return { root, vault, anchorNote };
}

/**
 * Run the CLI as a child process and capture everything a caller can observe.
 *
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
export function runWiki(args) {
  return capture(process.execPath, [CLI, ...args]);
}

/**
 * Run a command as a real child process and capture what a terminal would show. The one
 * place a fixture spawns anything, so `runWiki` and the git-repo fixture cannot drift.
 *
 * No shell: a shell on Windows re-splits the arguments, and nothing here needs one.
 *
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
export function capture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (exitCode) => resolve({ exitCode, stdout, stderr }));
  });
}

/** The fixed path the report is written to, relative to the directory holding the vault. */
export const REPORT_PATH = join(".wiki-health", "report.json");

export async function readReport(root) {
  return JSON.parse(await readFile(join(root, REPORT_PATH), "utf8"));
}

/** Look up one invariant's entry in a report by its number. */
export function invariant(report, id) {
  const found = report.invariants.find((entry) => entry.id === id);
  if (!found) throw new Error(`report has no invariant ${id}`);
  return found;
}
