// Ticket 15: a Note drafted by a Note Author from its Context Pack alone passes `check`. The
// run is an agent's, so it cannot happen inside a test; what is kept is its input and its
// output, in tests/fixtures/note-author/:
//
//   Signed arithmetic and order of operations.pack.md   the Pack `generate --layer 0` wrote
//   Signed arithmetic and order of operations.md        the Note after the agent's run
//
// The agent was given the Pack and its contract (.claude/agents/note-author.md) and read no
// other Note. The output is held to what the contract promises: it holds every invariant in
// the real vault, it is `status: drafted` and nothing more, and its `requires` and generated
// blocks are the stub's. Re-run the agent and replace both files when the Pack's contents
// change in a way an author would write differently from.

import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { checkVault, makeFixtureRoot, runWiki } from "./helpers/vault.js";

const NOTE = "Signed arithmetic and order of operations";
const PATH = join("algebra", `${NOTE}.md`);
const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures/note-author/", import.meta.url));

const lf = (text) => text.replace(/\r\n/g, "\n");
const drafted = async () => lf(await readFile(join(FIXTURES, `${NOTE}.md`), "utf8"));
const stub = async () => lf(await readFile(join(REPO_ROOT, "wiki", PATH), "utf8"));

/** A copy of the real repo's vault and raw store, with the Note replaced by the given text. */
async function realVaultHolding(text) {
  const fixture = await makeFixtureRoot();
  await cp(join(REPO_ROOT, "wiki"), fixture.vault, { recursive: true });
  await cp(join(REPO_ROOT, "raw"), join(fixture.root, "raw"), { recursive: true });
  await writeFile(join(fixture.vault, PATH), text, "utf8");
  return fixture;
}

test("the Pack the Note was drafted from is a Floor Pack that says no sources apply", async () => {
  const pack = lf(await readFile(join(FIXTURES, `${NOTE}.pack.md`), "utf8"));
  assert.match(pack, new RegExp(`^# Context Pack: ${NOTE}\n`));
  assert.match(pack, /\n## Sources\n\nNo sources apply\. This is a Floor Node/);
});

test("the Note drafted from the Pack alone holds every invariant in the real vault", async () => {
  const { stdout, report } = await checkVault(await realVaultHolding(await drafted()));

  assert.equal(report.summary.invariantsFailed, 0, stdout);
});

test("the Note Author set status: drafted and nothing else of the review state, and wrote no Edge", async () => {
  const [before, after] = [await stub(), await drafted()];
  const frontmatter = (text) => /^---\n[\s\S]*?\n---\n/.exec(text)[0];

  assert.match(after, /^status: drafted$/m);
  assert.match(after, /^reviewed_by: none$/m);
  assert.equal(
    frontmatter(after).replace(/^status: .*$/m, "").replace(/^updated: .*$/m, ""),
    frontmatter(before).replace(/^status: .*$/m, "").replace(/^updated: .*$/m, ""),
  );
});

test("the Note Author left every generated block as generate writes it", async () => {
  const [before, after] = [await stub(), await drafted()];
  const generated = (text) => text.slice(text.indexOf("## Builds on"), text.indexOf("## References"));
  assert.equal(generated(after), generated(before));

  const fixture = await realVaultHolding(await drafted());
  const { stdout } = await runWiki(["generate", fixture.vault]);
  // Its summary is new, so the Notes requiring it change; the Note itself does not.
  assert.doesNotMatch(stdout, new RegExp(`updated algebra/${NOTE}\\.md`));
});
