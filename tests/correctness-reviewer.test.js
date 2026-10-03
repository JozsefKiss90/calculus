// Ticket 16: a Correctness Reviewer, given one Review Bundle and its contract
// (.claude/agents/correctness-reviewer.md), catches a Note that assumes something none of its
// prerequisites teaches, and marks a sound Note agent-reviewed without marking it finished. The
// runs are an agent's, so they cannot happen inside a test; what is kept is their inputs and
// outputs, in tests/fixtures/correctness-reviewer/:
//
//   Distributive law, expansion, and like terms.md          a Layer 1 Note written to fail: it
//                                                           uses the index law, which only a
//                                                           Node outside its closure teaches.
//                                                           The run left it byte for byte as is
//   … .bundle.md                                            the Bundle `generate --review` wrote
//   … .review.md                                            the findings the reviewer recorded
//   Factors and multiples.drafted.md                        a sound Floor Note, before review
//   Factors and multiples.md                                the same Note after review
//   Factors and multiples.bundle.md, … .review.md           its Bundle and findings
//   Signed arithmetic and order of operations.bundle.md,
//   … .review.md                                            ticket 15's drafted Floor Note
//                                                           reviewed: it was not sound, and the
//                                                           findings say why
//
// Each run was in a copy of the real vault holding these drafted Notes and no others. Re-run
// the reviewer and replace the outputs when the Bundle or the contract changes in a way a
// reviewer would act on.

import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { checkVault, makeFixtureRoot } from "./helpers/vault.js";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures/correctness-reviewer/", import.meta.url));
const ARITHMETIC = "Signed arithmetic and order of operations";
const UNTAUGHT = "Distributive law, expansion, and like terms";
const SOUND = "Factors and multiples";

const lf = (text) => text.replace(/\r\n/g, "\n");
const fixture = async (file) => lf(await readFile(join(FIXTURES, file), "utf8"));
const frontmatter = (text) => /^---\n[\s\S]*?\n---\n/.exec(text)[0];

/** A copy of the real vault and raw store holding the drafted Notes the reviews ran against. */
async function reviewedVault() {
  const root = await makeFixtureRoot();
  await cp(join(REPO_ROOT, "wiki"), root.vault, { recursive: true });
  await cp(join(REPO_ROOT, "raw"), join(root.root, "raw"), { recursive: true });
  const notes = [
    [ARITHMETIC, await readFile(join(REPO_ROOT, "tests/fixtures/note-author", `${ARITHMETIC}.md`), "utf8")],
    [UNTAUGHT, await fixture(`${UNTAUGHT}.md`)],
    [SOUND, await fixture(`${SOUND}.md`)],
  ];
  for (const [name, text] of notes) await writeFile(join(root.vault, "algebra", `${name}.md`), text, "utf8");
  return root;
}

test("the reviewed Notes are real drafts: they hold every invariant in the real vault", async () => {
  const { stdout, report } = await checkVault(await reviewedVault());

  assert.equal(report.summary.invariantsFailed, 0, stdout);
});

test("the Bundle gave the reviewer the Note, its prerequisite whole, and the Node that teaches what it assumes", async () => {
  const [bundle, note, prerequisite] = [
    await fixture(`${UNTAUGHT}.bundle.md`),
    await fixture(`${UNTAUGHT}.md`),
    await readFile(join(REPO_ROOT, "tests/fixtures/note-author", `${ARITHMETIC}.md`), "utf8"),
  ];

  assert.ok(bundle.includes(note), "the Bundle lacks the Note as reviewed");
  // Its Required by block gained the Note's own summary when the Bundle was generated.
  const prose = (text) => lf(text).slice(lf(text).indexOf("## In one sentence"), lf(text).indexOf("## Builds on"));
  assert.ok(bundle.includes(prose(prerequisite)), "the Bundle lacks the prerequisite's prose");
  assert.match(bundle.split("## Not taught before it\n")[1].split("\n## ")[0], /\n- Index laws and fractional powers\n/);
});

test("a Note that assumes what no prerequisite teaches is caught, and stays reviewed_by: none", async () => {
  const [review, note] = [await fixture(`${UNTAUGHT}.review.md`), await fixture(`${UNTAUGHT}.md`)];

  assert.match(review, new RegExp(`^# Correctness review: ${UNTAUGHT}\n`));
  assert.match(review, /^\*\*Status:\*\* needs-triage$/m);
  const untaught = review.split(/\n#### /).filter((finding) => /^\d+\. untaught:/.test(finding));
  assert.ok(
    untaught.some((finding) => finding.includes("x^m \\times x^n = x^{m+n}") && finding.includes("Index laws and fractional powers")),
    "no untaught finding names the index law and the Node that teaches it",
  );
  assert.match(review, /`reviewed_by` stays `none`/);

  assert.match(note, /^status: drafted$/m);
  assert.match(note, /^reviewed_by: none$/m);
});

test("a sound Note is set reviewed_by: agent, and nothing else in it changes, status least of all", async () => {
  const [before, after, review] = [
    await fixture(`${SOUND}.drafted.md`),
    await fixture(`${SOUND}.md`),
    await fixture(`${SOUND}.review.md`),
  ];

  assert.match(after, /^status: drafted$/m);
  assert.match(after, /^reviewed_by: agent$/m);
  assert.equal(after, before.replace(/^reviewed_by: none$/m, "reviewed_by: agent"));
  assert.match(review, /^\*\*Status:\*\* ready-for-human$/m);
});

test("no review sets a human's state: no Note or findings file reaches status: reviewed or reviewed_by: human", async () => {
  for (const file of [
    `${UNTAUGHT}.md`,
    `${UNTAUGHT}.review.md`,
    `${SOUND}.md`,
    `${SOUND}.review.md`,
    `${ARITHMETIC}.review.md`,
  ]) {
    const text = await fixture(file);
    assert.doesNotMatch(text, /^status: reviewed$/m, file);
    assert.doesNotMatch(text, /^reviewed_by: human$/m, file);
  }
  assert.equal(frontmatter(await fixture(`${SOUND}.md`)).match(/^reviewed_by: .*$/gm).length, 1);
});
