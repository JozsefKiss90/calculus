// Ticket 06: `generate` writes the reverse direction of every Edge into the Notes —
// Builds on, Required by and the prerequisite mini-map — between their markers, and
// touches nothing else. Every fixture is a vault `scaffold` has just filled.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { anchorNoteContents, makeFixtureVault, readReport, runWiki } from "./helpers/vault.js";

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

const DERIVATIVE = "calculus/Derivative.md";
const ALGEBRA = "algebra/Algebra.md";
const FRACTIONS = "algebra/Equivalent fractions and cancellation.md";
const ARITHMETIC = "algebra/Signed arithmetic and order of operations.md";
const LIMITS = "limits/Limits.md";
const SINL = "limits/Limit of sin h over h as h approaches zero.md";

async function scaffoldedVault(graph = GRAPH) {
  const fixture = await makeFixtureVault(graph);
  const { exitCode, stderr } = await runWiki(["scaffold", fixture.vault]);
  assert.equal(exitCode, 0, stderr);
  return fixture;
}

const generate = (vault) => runWiki(["generate", vault]);

/** Every markdown file in the vault, relative path to contents. */
async function snapshot(vault) {
  const files = new Map();
  for (const entry of await readdir(vault, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const path = join(entry.parentPath ?? entry.path, entry.name);
    files.set(relative(vault, path).replaceAll("\\", "/"), await readFile(path, "utf8"));
  }
  return files;
}

const read = (vault, path) => readFile(join(vault, path), "utf8");

async function editNote(vault, path, change) {
  await writeFile(join(vault, path), change(await read(vault, path)), "utf8");
}

/** What lies between one block's markers, without them. */
function block(contents, name) {
  const match = new RegExp(`<!-- generated:start ${name} -->\\r?\\n([\\s\\S]*?)<!-- generated:end ${name} -->`).exec(
    contents,
  );
  assert.ok(match, `no ${name} block`);
  return match[1].replace(/\r\n/g, "\n").trimEnd();
}

/** A Note with every generated block emptied: what an author owns. */
const authored = (contents) =>
  contents.replace(/(<!-- generated:start (\S+) -->)[\s\S]*?(<!-- generated:end \2 -->)/g, "$1$3");

/** The paths whose contents differ between two snapshots. */
const changed = (before, after) =>
  [...new Set([...before.keys(), ...after.keys()])].filter((path) => before.get(path) !== after.get(path)).sort();

test("generate fills both lists for every Note, the Floor and the Terminal Node included", async () => {
  const { vault } = await scaffoldedVault();

  const { exitCode, stdout } = await generate(vault);

  assert.equal(exitCode, 0, stdout);
  assert.match(stdout, /updated 6 Notes, 0 already up to date/);

  const algebra = await read(vault, ALGEBRA);
  assert.equal(
    block(algebra, "builds-on"),
    "- [[Equivalent fractions and cancellation]]\n- [[Signed arithmetic and order of operations]]",
  );
  assert.equal(block(algebra, "required-by"), "- [[Derivative]]");

  // A Node required from two domains lists both, in name order.
  assert.equal(
    block(await read(vault, ARITHMETIC), "required-by"),
    "- [[Algebra]]\n- [[Limit of sin h over h as h approaches zero]]",
  );
  assert.equal(block(await read(vault, ARITHMETIC), "builds-on"), "*Nothing: this is a Floor Node, knowledge the Module assumes.*");
  assert.equal(block(await read(vault, DERIVATIVE), "required-by"), "*Nothing in this Module requires it.*");
  assert.equal(block(await read(vault, DERIVATIVE), "builds-on"), "- [[Algebra]]\n- [[Limits]]");
});

test("each entry carries its Note's one-sentence summary once one is written", async () => {
  const { vault } = await scaffoldedVault();
  await editNote(vault, FRACTIONS, (note) =>
    note.replace("## In one sentence\n", "## In one sentence\n\nTwo fractions are equal when one\nscales to the other.\n"),
  );

  await generate(vault);

  assert.equal(
    block(await read(vault, ALGEBRA), "builds-on"),
    "- [[Equivalent fractions and cancellation]] — Two fractions are equal when one scales to the other.\n" +
      "- [[Signed arithmetic and order of operations]]",
  );
});

test("a second run changes nothing and says so", async () => {
  const { vault } = await scaffoldedVault();
  await generate(vault);
  const before = await snapshot(vault);

  const { exitCode, stdout } = await generate(vault);

  assert.equal(exitCode, 0);
  assert.match(stdout, /no change: all 6 Notes already up to date/);
  assert.deepEqual(changed(before, await snapshot(vault)), []);
});

test("authored prose outside the markers is byte-identical, CRLF line endings included", async () => {
  const { vault } = await scaffoldedVault();
  await editNote(vault, LIMITS, (note) =>
    note
      .replace("## The idea\n", "## The idea\n\nA limit describes where a function is heading.  \nTrailing spaces stay.\n")
      .replace("## References\n", "## References\n\n- A textbook\n")
      .replace(/\n/g, "\r\n"),
  );
  const before = await snapshot(vault);

  await generate(vault);
  const after = await snapshot(vault);

  for (const [path, contents] of before) {
    if (path.endsWith("Anchor Graph.md")) continue;
    assert.equal(authored(after.get(path)), authored(contents), path);
  }
  assert.ok(!after.get(LIMITS).replace(/\r\n/g, "").includes("\n"), "a CRLF Note gained a bare LF");
});

test("generate never writes a prerequisite: every Note's frontmatter is untouched", async () => {
  const { vault } = await scaffoldedVault();
  const frontmatter = (contents) => /^---\n[\s\S]*?\n---\n/.exec(contents)[0];
  const before = await snapshot(vault);

  await generate(vault);
  const after = await snapshot(vault);

  for (const [path, contents] of before) assert.equal(frontmatter(after.get(path)), frontmatter(contents), path);
});

test("the mini-map draws the Note, its prerequisites and its dependents, arrows pointing at the prerequisite", async () => {
  const { vault } = await scaffoldedVault();

  await generate(vault);

  assert.equal(
    block(await read(vault, SINL), "mini-map"),
    [
      "```mermaid",
      "flowchart TD",
      '    N["Limit of sin h over h as h approaches zero"]',
      '    N --> P1["Signed arithmetic and order of operations"]',
      '    D1["Limits"] --> N',
      "    class N,P1,D1 internal-link",
      "    style N stroke-width:3px",
      "```",
    ].join("\n"),
  );
});

test("the mini-map follows the Required by list, and a Note scaffolded without its markers gains them there", async () => {
  const { vault } = await scaffoldedVault();
  // A Note scaffolded before 06 introduced the mini-map block.
  await editNote(vault, LIMITS, (note) => note.replace("\n\n<!-- generated:start mini-map -->\n<!-- generated:end mini-map -->", ""));

  const { exitCode } = await generate(vault);
  const limits = await read(vault, LIMITS);

  assert.equal(exitCode, 0);
  assert.match(
    limits,
    /<!-- generated:end required-by -->\n\n<!-- generated:start mini-map -->\n```mermaid\n[\s\S]*\n```\n<!-- generated:end mini-map -->\n\n## References\n/,
  );
});

test("a hand-edited generated block is overwritten on the next run", async () => {
  const { vault } = await scaffoldedVault();
  await generate(vault);
  const generated = await read(vault, ALGEBRA);
  await editNote(vault, ALGEBRA, (note) => note.replace("- [[Derivative]]", "- [[Derivative]]\n- [[Something I added by hand]]"));

  const { stdout } = await generate(vault);

  assert.match(stdout, /updated algebra\/Algebra\.md/);
  assert.equal(await read(vault, ALGEBRA), generated);
});

test("adding a Node, scaffolding it and regenerating changes only the Notes the new Edge touches", async () => {
  const { root, vault, anchorNote } = await scaffoldedVault();
  await generate(vault);
  const before = await snapshot(vault);

  // The human's half: the Anchor Graph gains a Node, and the Note that now requires it says so.
  await writeFile(anchorNote, anchorNoteContents(GRAPH.replace("SINL --> AR", 'SINL --> AR\n        L --> AV["Absolute value"]')), "utf8");
  assert.equal((await runWiki(["scaffold", vault])).exitCode, 0);
  await editNote(vault, LIMITS, (note) => note.replace("requires:\n", 'requires:\n  - "[[Absolute value]]"\n'));
  const { stdout } = await generate(vault);

  assert.deepEqual(changed(before, await snapshot(vault)), ["Module 1 Anchor Graph.md", "limits/Absolute value.md", LIMITS]);
  assert.match(stdout, /updated 2 Notes, 5 already up to date/);
  assert.equal(block(await read(vault, "limits/Absolute value.md"), "required-by"), "- [[Limits]]");

  const { exitCode } = await runWiki(["check", vault]);
  assert.equal(exitCode, 0, JSON.stringify((await readReport(root)).invariants.filter((i) => i.status === "fail")));
});

test("a Note whose markers are broken is left alone and named, and every other Note is still written", async () => {
  const { vault } = await scaffoldedVault();
  await editNote(vault, LIMITS, (note) => note.replace("<!-- generated:end builds-on -->\n", ""));
  const broken = await read(vault, LIMITS);

  const { exitCode, stdout } = await generate(vault);

  assert.equal(exitCode, 1);
  assert.match(stdout, /left alone limits\/Limits\.md:\n {2}the builds-on block's markers must appear once each/);
  assert.match(stdout, /updated 5 Notes, 0 already up to date, 1 left alone/);
  assert.equal(await read(vault, LIMITS), broken);
});

test("generate on a directory that does not exist refuses and writes nothing", async () => {
  const { root } = await scaffoldedVault();

  const { exitCode, stderr } = await generate(join(root, "no-such-vault"));

  assert.equal(exitCode, 2);
  assert.match(stderr, /generate could not run/);
});
