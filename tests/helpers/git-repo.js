// The fixture for ticket 03's gate: a throwaway git repository holding this repo's
// tooling, driven through real `git commit` calls.
//
// This follows the convention in `vault.js` one level out. `vault.js` drives the CLI as a
// child process against a fixture vault; this drives *git* as a child process against a
// fixture repo, because the thing under test is the hook refusing a commit, and a hook
// that is not run by git is not a gate. The Note's contents and the spawn helper come from
// `vault.js` so there is one definition of each. Nothing is mocked and nothing is imported
// from `scripts/lib/`.

import { mkdtemp, mkdir, writeFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { anchorNoteContents, capture } from "./vault.js";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

/**
 * Copied into every fixture repo: what `npm run check` needs (the Archetype catalogue among
 * it, since invariant 9 validates against it), the hook itself, and
 * `.gitattributes` — without which a fixture would not carry the line-ending pinning the
 * hook depends on, and `cloneWithCrlf` would be testing a different repo than this one.
 */
const TOOLING = ["package.json", "scripts", "docs/archetype-catalogue.md", ".githooks", ".gitignore", ".gitattributes"];

/**
 * A graph satisfying invariants 1 to 4 — one root, every path reaching the Floor, nothing
 * unreachable — so a fixture's first commit is a clean one and the violation is the edit.
 */
export const CLEAN_GRAPH = `flowchart TD
  D["Derivative"] --> L["Limit"]
  D --> F["Function"]
  L --> F`;

/**
 * The same graph with a cycle below the root, so the Terminal Node is still the only Node
 * nothing requires and the edit's only structural fault is the cycle. Invariant 3 goes with
 * it either way — per 02, a path can only miss the Floor by circling forever.
 */
export const CYCLIC_GRAPH = `${CLEAN_GRAPH}
  F --> L`;

/**
 * A fixture repo with the tooling committed and the hook installed by the documented
 * one-step setup, its first commit already through the gate.
 *
 * @param {{installHook?: boolean}} options pass `installHook: false` for the developer
 *   who never ran the setup step — the case CI exists to catch.
 * @returns {Promise<{root: string}>}
 */
export async function makeFixtureRepo({ installHook = true } = {}) {
  const root = await mkdtemp(join(tmpdir(), "calculus-hook-"));

  await git(root, ["init", "--quiet", "--initial-branch=main"]);
  await git(root, ["config", "user.name", "Fixture"]);
  await git(root, ["config", "user.email", "fixture@example.com"]);
  await git(root, ["config", "commit.gpgsign", "false"]);
  if (installHook) await git(root, ["config", "core.hooksPath", ".githooks"]);

  for (const entry of TOOLING) {
    await cp(join(REPO_ROOT, entry), join(root, entry), { recursive: true });
  }
  await mkdir(join(root, "wiki"), { recursive: true });
  await writeAnchorGraph(root, CLEAN_GRAPH);

  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", FIRST_COMMIT]);
  return { root };
}

/** The subject of the clean commit every fixture repo starts from. */
export const FIRST_COMMIT = "Commit the tooling and a clean graph";

/**
 * Clone a fixture repo the way a developer with `core.autocrlf` on gets it — git rewrites
 * the working copy on checkout — with the hook installed by the documented setup. The point
 * is whether the hook still runs once git has touched it.
 *
 * @returns {Promise<{root: string}>}
 */
export async function cloneWithCrlf(origin) {
  const parent = await mkdtemp(join(tmpdir(), "calculus-clone-"));
  const root = join(parent, "clone");

  await git(parent, ["-c", "core.autocrlf=true", "clone", "--quiet", origin, root]);
  await git(root, ["config", "user.name", "Fixture"]);
  await git(root, ["config", "user.email", "fixture@example.com"]);
  await git(root, ["config", "commit.gpgsign", "false"]);
  await git(root, ["config", "core.hooksPath", ".githooks"]);
  return { root };
}

/** Write the Anchor Graph Note, its mermaid block holding the given graph. */
export async function writeAnchorGraph(root, mermaidBody) {
  const note = join(root, "wiki", "Module 1 Anchor Graph.md");
  await writeFile(note, anchorNoteContents(mermaidBody), "utf8");
}

/** Stage everything and commit, returning what a developer at the terminal would see. */
export async function commit(root, message) {
  await git(root, ["add", "-A"]);
  return capture("git", ["commit", "-m", message], { cwd: root });
}

/** `git log` subjects, so a test can assert whether a commit actually landed. */
export async function commitSubjects(root) {
  const { stdout } = await git(root, ["log", "--format=%s"]);
  return stdout.trim().split("\n").filter(Boolean);
}

/** A git call a test relies on rather than asserts about: a failure here is a broken fixture. */
async function git(root, args) {
  const result = await capture("git", args, { cwd: root });
  if (result.exitCode !== 0) {
    throw new Error(`fixture setup failed: git ${args.join(" ")}\n${result.stderr}`);
  }
  return result;
}
