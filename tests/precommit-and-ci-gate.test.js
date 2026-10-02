// Ticket 03: the gate runs by itself. `check` is wired as a pre-commit hook and as a CI
// job, and non-zero exit is the whole contract — the hook refuses the commit, CI fails the
// build. The first five tests drive real `git commit` calls in a fixture repo, because a
// hook git does not run is not a gate.
//
// The last two are deliberately outside the CLI seam the spec establishes, declared here as
// 02 declared its own exception. The wiring is configuration, not code: it emits no files
// and returns no exit code of its own, so there is nothing observable to assert on — and
// the thing most worth guarding is that nobody quietly adds a suppression. CI cannot be run
// from a test at all. Reading the two files is the only seam there is, so these two assert
// on their contents and nothing else does.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLEAN_GRAPH,
  CYCLIC_GRAPH,
  FIRST_COMMIT,
  cloneWithCrlf,
  commit,
  commitSubjects,
  makeFixtureRepo,
  writeAnchorGraph,
} from "./helpers/git-repo.js";
import { runWiki } from "./helpers/vault.js";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Everything the developer sees from one `git commit`, hook output included. */
const output = (result) => `${result.stdout}${result.stderr}`;

test("a commit that introduces a structural violation is refused", async () => {
  const { root } = await makeFixtureRepo();

  await writeAnchorGraph(root, CYCLIC_GRAPH);
  const refused = await commit(root, "Add a cycle to the Anchor Graph");

  assert.notEqual(refused.exitCode, 0);
  assert.deepEqual(await commitSubjects(root), [FIRST_COMMIT]);
});

test("the refusal shows the report's human summary, naming the broken invariant", async () => {
  const { root } = await makeFixtureRepo();

  await writeAnchorGraph(root, CYCLIC_GRAPH);
  const refused = await commit(root, "Add a cycle to the Anchor Graph");
  const shown = output(refused);

  assert.match(shown, /FAIL\s+1\s+The Edge graph is acyclic/);
  assert.match(shown, /prerequisite cycle: Limit requires Function requires Limit/);
  assert.match(shown, /check failed: \d+ invariants? of 9 broken/);
  assert.match(shown, /report:/);
});

test("a commit that keeps the invariants passes the gate", async () => {
  const { root } = await makeFixtureRepo();

  await writeAnchorGraph(root, `${CLEAN_GRAPH}\n  L --> C["Continuity"]\n  C --> F`);
  const accepted = await commit(root, "Add Continuity between Limit and Function");

  assert.equal(accepted.exitCode, 0, output(accepted));
  assert.equal((await commitSubjects(root)).length, 2);
});

test("the hook shows exactly what a human running check sees, and nothing of its own", async () => {
  const { root } = await makeFixtureRepo();

  await writeAnchorGraph(root, CYCLIC_GRAPH);
  const refused = await commit(root, "Add a cycle to the Anchor Graph");
  const byHand = await runWiki(["check", join(root, "wiki")]);

  assert.ok(byHand.stdout.length > 0);
  assert.ok(
    output(refused).includes(byHand.stdout),
    `the hook's output is not the summary a human sees.\nhook:\n${output(refused)}\nby hand:\n${byHand.stdout}`,
  );
});

test("a developer who has not installed the hook is not stopped locally — CI is the backstop", async () => {
  const { root } = await makeFixtureRepo({ installHook: false });

  await writeAnchorGraph(root, CYCLIC_GRAPH);
  const landed = await commit(root, "Add a cycle to the Anchor Graph");

  assert.equal(landed.exitCode, 0, output(landed));
  assert.equal((await commitSubjects(root)).length, 2);
});

test("the gate still refuses a commit after a clone that rewrites line endings", async () => {
  const { root: origin } = await makeFixtureRepo();
  const { root } = await cloneWithCrlf(origin);

  // The bytes, not the behaviour: without `.gitattributes` this clone's hook arrives CRLF
  // and `/bin/sh` rejects its shebang, which is a gate that stops gating on every Unix
  // machine and in CI. Git for Windows' own shell tolerates CRLF, so a run here would pass
  // either way — this assertion is what makes the test discriminate on any platform.
  const hook = await readFile(join(root, ".githooks", "pre-commit"), "utf8");
  assert.doesNotMatch(hook, /\r/, "the cloned hook has CRLF line endings and will not run");

  await writeAnchorGraph(root, CYCLIC_GRAPH);
  const refused = await commit(root, "Add a cycle to the Anchor Graph");

  assert.notEqual(refused.exitCode, 0, output(refused));
  assert.match(output(refused), /FAIL\s+1\s+The Edge graph is acyclic/);
});

test("the hook runs the same npm script a human runs, with no suppressions", async () => {
  const hook = await readFile(join(REPO_ROOT, ".githooks", "pre-commit"), "utf8");
  const commands = hook
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  assert.deepEqual(commands, ["npm run check"]);
  // See `.gitattributes`: a CRLF shebang makes the hook stop running, silently.
  assert.doesNotMatch(hook, /\r/, "the hook has CRLF line endings and will not run");
});

test("CI runs the same npm scripts on every push, with no suppressions", async () => {
  // The gate's own workflow by name: a second workflow added later must not be able to
  // satisfy these assertions on this one's behalf.
  const ci = await readFile(join(REPO_ROOT, ".github", "workflows", "check.yml"), "utf8");

  assert.match(ci, /^on:\n\s+push:/m);
  assert.match(ci, /run: npm run check$/m);
  assert.match(ci, /run: npm test$/m);
  assert.doesNotMatch(ci, /continue-on-error|\|\| true|exit 0/);
});
