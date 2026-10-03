// Ticket 14: source Notes and the immutable raw store. `raw/` sits beside the vault, outside
// it, and `raw/checksums.sha256` tracks every extract by its SHA-256, in the format
// `sha256sum -c` reads. Invariant 12 fails when a tracked file's bytes change, when a tracked
// file is gone, and when a file sits in `raw/` untracked, since an untracked file is one
// nothing protects. It also holds each source Note's `source_file` to a file in `raw/`.
// Invariant 7 holds the three keys a source Note adds.
//
// Every fixture is a scaffolded vault plus one curated reference — a raw extract, its
// checksum, and the source Note citing it — with one thing broken by hand.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { checkVault as check, invariant, makeScaffoldedVault } from "./helpers/vault.js";

const GRAPH = `flowchart TD
    D["Derivative"] --> L["Limits"]

    subgraph LIM["Limits"]
        L --> A["Approaching a value"]
    end`;

const EXTRACT = "limit-of-a-function.html";
const EXTRACT_CONTENTS = '<div data-type="page"><h1>The Limit of a Function</h1></div>\n';
const SOURCE_NOTE = "sources/A Calculus Textbook.md";

const sha256 = (contents) => createHash("sha256").update(contents).digest("hex");

const sourceNote = ({
  sourceFile = `raw/${EXTRACT}`,
  sourceType = "textbook",
  dateIngested = "2026-10-03",
} = {}) => {
  // null leaves a key out; undefined would only bring its default back.
  const line = (key, value) => (value === null ? "" : `${key}: ${value}\n`);
  return `---
kind: source
domain: sources
requires: []
status: drafted
reviewed_by: none
created: 2026-10-03
updated: 2026-10-03
${line("source_file", sourceFile)}${line("source_type", sourceType)}${line("date_ingested", dateIngested)}---

## In one sentence

A fixture textbook's section on limits.
`;
};

/** A scaffolded vault with one reference curated into it: extract, checksum and source Note. */
async function curatedVault(note = sourceNote()) {
  const fixture = await makeScaffoldedVault(GRAPH);
  const raw = join(fixture.root, "raw");
  await mkdir(raw, { recursive: true });
  await writeFile(join(raw, EXTRACT), EXTRACT_CONTENTS, "utf8");
  await writeFile(join(raw, "checksums.sha256"), `${sha256(EXTRACT_CONTENTS)}  ${EXTRACT}\n`, "utf8");
  await writeFile(join(raw, "README.md"), "# raw/\n\nImmutable.\n", "utf8");
  await mkdir(join(fixture.vault, "sources"), { recursive: true });
  await writeFile(join(fixture.vault, SOURCE_NOTE), note, "utf8");
  return { ...fixture, raw };
}

/** The failures of one invariant, as [problem, what it names] pairs. */
const problems = (report, id) =>
  invariant(report, id).failures.map((failure) => [failure.problem, failure.file ?? failure.note]);

test("a source Note citing a tracked, unchanged raw file passes every invariant", async () => {
  const { exitCode, stdout, report } = await check(await curatedVault());

  assert.equal(exitCode, 0, stdout);
  assert.deepEqual(
    report.invariants.map((entry) => [entry.id, entry.status]),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((id) => [id, "pass"]),
  );
  assert.equal(invariant(report, 12).name, "raw-store-unchanged");
  assert.deepEqual(report.notes, { notes: 5, conceptNotes: 3 });
});

test("invariant 12: one changed byte in a tracked raw file fails check and names the file", async () => {
  const fixture = await curatedVault();
  await writeFile(join(fixture.raw, EXTRACT), EXTRACT_CONTENTS.replace("Limit", "limit"), "utf8");

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 12), [["raw-file-changed", `raw/${EXTRACT}`]]);
  assert.match(stdout, /raw\/limit-of-a-function\.html: its content has changed since it was extracted/);
});

test("invariant 12: a tracked raw file that is deleted fails, and so does the source Note citing it", async () => {
  const fixture = await curatedVault();
  await rm(join(fixture.raw, EXTRACT));

  const { exitCode, report } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 12), [
    ["raw-file-missing", `raw/${EXTRACT}`],
    ["unresolved-source-file", `raw/${EXTRACT}`],
  ]);
  assert.equal(invariant(report, 12).failures[1].note, SOURCE_NOTE);
});

test("invariant 12: a file added to raw/ without a checksum is untracked, and fails", async () => {
  const fixture = await curatedVault();
  await mkdir(join(fixture.raw, "later"), { recursive: true });
  await writeFile(join(fixture.raw, "later", "extract.html"), "<p>unprotected</p>\n", "utf8");

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 12), [["raw-file-untracked", "raw/later/extract.html"]]);
  assert.match(stdout, /raw\/later\/extract\.html: has no checksum in checksums\.sha256/);
});

test("invariant 12: an extract appended with its checksum is tracked, the store's README never is", async () => {
  const fixture = await curatedVault();
  const later = "<p>a second extract</p>\n";
  await writeFile(join(fixture.raw, "second.html"), later, "utf8");
  await appendFile(join(fixture.raw, "checksums.sha256"), `${sha256(later)} *second.html\n`, "utf8");
  await appendFile(join(fixture.raw, "README.md"), "\nEdited, and not an extract.\n", "utf8");

  const { exitCode, stdout, report } = await check(fixture);

  assert.equal(exitCode, 0, stdout);
  assert.equal(invariant(report, 12).status, "pass");
});

test("invariant 12: a checksum line that cannot be read fails rather than tracking nothing", async () => {
  const fixture = await curatedVault();
  await appendFile(join(fixture.raw, "checksums.sha256"), `not-a-hash  ${EXTRACT}\n`, "utf8");

  const { report } = await check(fixture);

  assert.deepEqual(problems(report, 12), [["unreadable-checksum", "raw/checksums.sha256"]]);
});

test("invariant 12: a source_file naming no file in raw/ fails and names the source Note", async () => {
  const fixture = await curatedVault(sourceNote({ sourceFile: "raw/not-extracted.html" }));

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 12), [["unresolved-source-file", "raw/not-extracted.html"]]);
  assert.match(stdout, /sources\/A Calculus Textbook\.md: source_file is raw\/not-extracted\.html, and no such file exists in raw\//);
});

test("invariant 12: a vault with no raw store and no source Note has nothing to protect, and holds", async () => {
  const { exitCode, report } = await check(await makeScaffoldedVault(GRAPH));

  assert.equal(exitCode, 0);
  assert.deepEqual(invariant(report, 12).failures, []);
});

/** The failures of invariant 7 naming the source Note, as [problem, message] pairs. */
const sourceKeyProblems = (report) =>
  invariant(report, 7)
    .failures.filter((failure) => failure.note === SOURCE_NOTE)
    .map((failure) => [failure.problem, failure.message.slice(`${SOURCE_NOTE}: `.length)]);

test("invariant 7: a source Note missing source_file, source_type and date_ingested fails on each", async () => {
  const fixture = await curatedVault(
    sourceNote({ sourceFile: null, sourceType: null, dateIngested: null }),
  );

  const { exitCode, report } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(sourceKeyProblems(report), [
    ["missing-key", "source_file is required on a kind: source Note and absent"],
    ["missing-key", "source_type is required on a kind: source Note and absent"],
    ["missing-key", "date_ingested is required on a kind: source Note and absent"],
  ]);
});

test("invariant 7: a source_type outside its closed set fails", async () => {
  const { exitCode, report } = await check(await curatedVault(sourceNote({ sourceType: "blog" })));

  assert.notEqual(exitCode, 0);
  assert.deepEqual(sourceKeyProblems(report), [
    ["out-of-enum-value", 'source_type is "blog", which is not one of textbook, lecture-notes, paper, reference-work, curriculum'],
  ]);
});

test("invariant 7: a date_ingested that is not a real YYYY-MM-DD date fails", async () => {
  for (const dateIngested of ["2026-02-30", "03/10/2026", "yesterday"]) {
    const { exitCode, report } = await check(await curatedVault(sourceNote({ dateIngested })));

    assert.notEqual(exitCode, 0, dateIngested);
    assert.deepEqual(sourceKeyProblems(report), [
      ["malformed-value", `date_ingested is "${dateIngested}", which is not a date written YYYY-MM-DD`],
    ]);
  }
});

test("invariant 7: a source_file that is not a path inside raw/ fails, before anything looks for it", async () => {
  for (const sourceFile of ["limit-of-a-function.html", "raw/../wiki/index.md", "raw\\limit-of-a-function.html", "raw/checksums.sha256"]) {
    const { exitCode, report } = await check(await curatedVault(sourceNote({ sourceFile })));

    assert.notEqual(exitCode, 0, sourceFile);
    assert.deepEqual(sourceKeyProblems(report), [
      ["malformed-value", `source_file is "${sourceFile}", which is not a path to an extract in raw/, such as raw/<file>`],
    ]);
    assert.equal(invariant(report, 12).status, "pass", "a malformed source_file is invariant 7's alone");
  }
});

test("git keeps every raw file byte for byte, so a clone that rewrites line endings changes no checksum", async () => {
  const attributes = await readFile(fileURLToPath(new URL("../.gitattributes", import.meta.url)), "utf8");

  assert.match(attributes, /^raw\/\*\* -text\b/m);
});
