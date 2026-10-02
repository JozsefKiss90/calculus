// Ticket 05: `check` holds the Notes to invariants 5, 6, 7 and 10, and to the Anchor Graph
// through invariant 11. Every fixture starts as a vault `scaffold` has just filled, which
// satisfies all of them, and each violating fixture breaks one thing by hand — the way an
// agent or a human would.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { anchorNoteContents, invariant, makeFixtureVault, readReport, runWiki } from "./helpers/vault.js";

/** Shaped like the real Module: domains as subgraphs, and one Node whose name needs spelling out. */
const GRAPH = `flowchart TD
    D["Derivative"] --> A["Algebra"]
    D --> L["Limits"]

    subgraph ALG["Algebra"]
        A --> FR["Equivalent fractions and cancellation"]
        A --> AR["Signed arithmetic and order of operations"]
    end

    subgraph LIM["Limits"]
        L --> SINL["Limit of sin h / h as h approaches zero"]
        SINL --> AR
    end`;

const ALGEBRA = "algebra/Algebra.md";
const FRACTIONS = "algebra/Equivalent fractions and cancellation.md";
const ARITHMETIC = "algebra/Signed arithmetic and order of operations.md";
const LIMITS = "limits/Limits.md";

async function scaffoldedVault(graph = GRAPH) {
  const fixture = await makeFixtureVault(graph);
  const { exitCode, stderr } = await runWiki(["scaffold", fixture.vault]);
  assert.equal(exitCode, 0, stderr);
  return fixture;
}

async function check({ root, vault }) {
  const { exitCode, stdout, stderr } = await runWiki(["check", vault]);
  return { exitCode, stdout, stderr, report: await readReport(root) };
}

async function editNote(vault, path, change) {
  const file = join(vault, path);
  await writeFile(file, change(await readFile(file, "utf8")), "utf8");
}

/** The failures of one invariant, as [problem, note] pairs. */
const problems = (report, id) => invariant(report, id).failures.map((failure) => [failure.problem, failure.note]);

test("check on a freshly scaffolded vault exits 0, every invariant checked and holding", async () => {
  const { exitCode, stdout, report } = await check(await scaffoldedVault());

  assert.equal(exitCode, 0, stdout);
  assert.deepEqual(
    report.invariants.map((entry) => [entry.id, entry.status]),
    [1, 2, 3, 4, 5, 6, 7, 10, 11].map((id) => [id, "pass"]),
  );
  assert.deepEqual(report.notes, { notes: 7, conceptNotes: 6 });
});

test("invariant 5: a prerequisite pointing at a deleted Note is caught and names the Note holding it", async () => {
  const fixture = await scaffoldedVault();
  await rm(join(fixture.vault, FRACTIONS));

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.equal(invariant(report, 5).status, "fail");
  assert.deepEqual(problems(report, 5), [["unresolved-prerequisite", ALGEBRA]]);
  assert.match(stdout, /algebra\/Algebra\.md: requires \[\[Equivalent fractions and cancellation\]\], and no Note has that name/);
});

test("invariant 5: a requires entry that is not a wikilink does not resolve", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, ALGEBRA, (note) =>
    note.replace('"[[Equivalent fractions and cancellation]]"', "Equivalent fractions and cancellation"),
  );

  const { exitCode, report } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 5), [["prerequisite-not-a-wikilink", ALGEBRA]]);
});

test("invariant 5: a wikilink resolves the way Obsidian resolves it, ignoring case and display text", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, ALGEBRA, (note) =>
    note.replace("[[Equivalent fractions and cancellation]]", "[[equivalent Fractions and cancellation|fractions]]"),
  );

  const { exitCode, report } = await check(fixture);

  assert.equal(exitCode, 0);
  assert.equal(invariant(report, 5).status, "pass");
  assert.equal(invariant(report, 11).status, "pass");
});

test("invariant 6: a Note moved out of its domain directory is caught by its domain, not by its links", async () => {
  const fixture = await scaffoldedVault();
  await rename(join(fixture.vault, FRACTIONS), join(fixture.vault, "limits/Equivalent fractions and cancellation.md"));

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 6), [["domain-mismatch", "limits/Equivalent fractions and cancellation.md"]]);
  assert.match(stdout, /domain is "algebra", but the Note is in limits/);
  assert.equal(invariant(report, 5).status, "pass");
  assert.equal(invariant(report, 11).status, "pass");
});

test("invariant 6: the domain of a Note at the vault root is the vault directory's own name", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, "Module 1 Anchor Graph.md", (note) => note.replace("domain: wiki", "domain: calculus"));

  const { exitCode, report } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 6), [["domain-mismatch", "Module 1 Anchor Graph.md"]]);
});

test("invariant 7: a frontmatter key outside the schema is caught and named", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) => note.replace("status: stub", "status: stub\ndifficulty: 3"));

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 7), [["undeclared-key", LIMITS]]);
  assert.match(stdout, /limits\/Limits\.md: difficulty is not a frontmatter key in the schema/);
});

test("invariant 7: an enum value outside its closed set is caught, and named apart from an undeclared key", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) => note.replace("reviewed_by: none", "reviewed_by: nobody"));

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 7), [["out-of-enum-value", LIMITS]]);
  assert.match(stdout, /reviewed_by is "nobody", which is not one of none, agent, human/);
});

test("invariant 7: a required key that is missing, a nested mapping, and a repeated prerequisite are each named", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) =>
    note
      .replace(/^updated: .*\n/m, "")
      .replace("status: stub", "status: stub\naliases:\n  first: nested")
      .replace('  - "[[Limit of sin h over h as h approaches zero]]"', '  - "[[Limit of sin h over h as h approaches zero]]"\n  - "[[Limit of sin h over h as h approaches zero]]"'),
  );

  const { exitCode, report } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(
    problems(report, 7).map(([problem]) => problem).sort(),
    ["duplicate-prerequisite", "missing-key", "unreadable-frontmatter"],
  );
});

test("invariant 7: a key that belongs only on a source Note is undeclared on a concept Note", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) => note.replace("status: stub", "status: stub\nsource_file: raw/book.pdf"));

  const { report } = await check(fixture);

  assert.deepEqual(problems(report, 7), [["undeclared-key", LIMITS]]);
});

test("invariant 10: a drafted Note with an empty one-sentence summary is caught", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) => note.replace("status: stub", "status: drafted"));

  const { exitCode, report, stdout } = await check(fixture);

  assert.notEqual(exitCode, 0);
  assert.deepEqual(problems(report, 10), [["empty-summary", LIMITS]]);
  assert.match(stdout, /limits\/Limits\.md: is status: drafted and its ## In one sentence is empty/);
});

test("invariant 10: a drafted Note with its one-sentence summary written passes, and a stub needs none", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) =>
    note
      .replace("status: stub", "status: reviewed")
      .replace("## In one sentence\n", "## In one sentence\n\nA limit is the value a function approaches.\n"),
  );

  const { exitCode, report } = await check(fixture);

  assert.equal(exitCode, 0);
  assert.equal(invariant(report, 10).status, "pass");
});

test("invariant 10: a drafted Note with no one-sentence section at all is named apart from an empty one", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) =>
    note.replace("status: stub", "status: drafted").replace("## In one sentence\n", ""),
  );

  const { report } = await check(fixture);

  assert.deepEqual(problems(report, 10), [["missing-summary", LIMITS]]);
});

test("invariant 11: a Node added to the Anchor Graph but not yet scaffolded is a one-sided mismatch naming the missing Note", async () => {
  const fixture = await scaffoldedVault();
  await writeFile(
    fixture.anchorNote,
    anchorNoteContents(GRAPH.replace("SINL --> AR", 'SINL --> AR\n        L --> AV["Absolute value"]')),
    "utf8",
  );

  const { exitCode, report, stdout } = await check(fixture);
  const [anchorOnly, notesOnly] = invariant(report, 11).failures;

  assert.notEqual(exitCode, 0);
  assert.equal(invariant(report, 11).status, "fail");
  assert.deepEqual(anchorOnly.nodes, ["Absolute value"]);
  assert.deepEqual(anchorOnly.edges, [{ from: "Limits", to: "Absolute value" }]);
  assert.deepEqual(notesOnly.nodes, []);
  assert.deepEqual(notesOnly.edges, []);
  assert.match(stdout, /in the Anchor Graph but not the Notes: Node "Absolute value" has no Note; scaffold creates it/);
  assert.match(stdout, /in the Notes but not the Anchor Graph: nothing/);
});

test("invariant 11: a prerequisite an agent added to a Note is a mismatch the other way", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, FRACTIONS, (note) =>
    note.replace("requires: []", 'requires:\n  - "[[Signed arithmetic and order of operations]]"'),
  );

  const { exitCode, report, stdout } = await check(fixture);
  const [anchorOnly, notesOnly] = invariant(report, 11).failures;

  assert.notEqual(exitCode, 0);
  assert.deepEqual(anchorOnly.edges, []);
  assert.deepEqual(notesOnly.edges, [
    { from: "Equivalent fractions and cancellation", to: "Signed arithmetic and order of operations" },
  ]);
  assert.match(stdout, /in the Anchor Graph but not the Notes: nothing/);
  assert.match(
    stdout,
    /in the Notes but not the Anchor Graph: "Equivalent fractions and cancellation" requires "Signed arithmetic and order of operations", an Edge the Anchor Graph does not have/,
  );
});

test("invariant 11: a rewired prerequisite lists both directions of the mismatch separately", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, ALGEBRA, (note) =>
    note.replace('"[[Equivalent fractions and cancellation]]"', '"[[Limits]]"'),
  );

  const { exitCode, report } = await check(fixture);
  const [anchorOnly, notesOnly] = invariant(report, 11).failures;

  assert.notEqual(exitCode, 0);
  assert.equal(anchorOnly.problem, "in-anchor-graph-not-notes");
  assert.deepEqual(anchorOnly.edges, [{ from: "Algebra", to: "Equivalent fractions and cancellation" }]);
  assert.equal(notesOnly.problem, "in-notes-not-anchor-graph");
  assert.deepEqual(notesOnly.edges, [{ from: "Algebra", to: "Limits" }]);
});

test("invariant 11: a deleted Note reads as a missing Node, not as one recreated by the links to it", async () => {
  const fixture = await scaffoldedVault();
  await rm(join(fixture.vault, ARITHMETIC));

  const { report } = await check(fixture);
  const [anchorOnly] = invariant(report, 11).failures;

  assert.deepEqual(anchorOnly.nodes, ["Signed arithmetic and order of operations"]);
});

test("files without frontmatter, and Notes that are not concepts, are left out of every graph computation", async () => {
  const fixture = await scaffoldedVault();
  const { vault } = fixture;
  // Structural files mention links and keys freely; they carry no frontmatter.
  await writeFile(join(vault, "CLAUDE.md"), "# How to edit this vault\n\nSee [[No such Note]].\n", "utf8");
  await writeFile(join(vault, "index.md"), "requires: [[Derivative]]\n\n- [[Limits]]\n", "utf8");
  await writeFile(join(vault, "log.md"), "# Log\n\ndifficulty: 3\n", "utf8");
  // A source Note carries frontmatter and is no Node.
  await mkdir(join(vault, "sources"), { recursive: true });
  await writeFile(
    join(vault, "sources", "Stewart Calculus.md"),
    `---
kind: source
domain: sources
requires: []
status: stub
reviewed_by: none
created: 2026-10-02
updated: 2026-10-02
source_file: raw/stewart.pdf
source_type: textbook
date_ingested: 2026-10-02
---
`,
    "utf8",
  );

  const { exitCode, stdout, report } = await check(fixture);

  assert.equal(exitCode, 0, stdout);
  assert.deepEqual(report.notes, { notes: 8, conceptNotes: 6 });
});

test("invariant 5: a concept Note cannot require a Note that is not a concept", async () => {
  const fixture = await scaffoldedVault();
  await editNote(fixture.vault, LIMITS, (note) => note.replace("requires:\n", 'requires:\n  - "[[Module 1 Anchor Graph]]"\n'));

  const { report } = await check(fixture);

  assert.deepEqual(problems(report, 5), [["prerequisite-not-a-concept", LIMITS]]);
});
