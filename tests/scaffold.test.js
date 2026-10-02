// Ticket 04: `scaffold` turns the Anchor Graph into one stub Note per Node, so every
// prerequisite link resolves before any content exists. Driven from outside like every
// other test here: a fixture vault, the CLI as a child process, assertions on the files it
// writes, what it prints and its exit code.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, writeFile, mkdir, copyFile, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { makeFixtureRoot, makeFixtureVault, runWiki } from "./helpers/vault.js";

const REAL_ANCHOR_NOTE = fileURLToPath(new URL("../wiki/Module 1 Anchor Graph.md", import.meta.url));

/**
 * A small Module shaped like the real one: the Terminal Node outside every subgraph, each
 * domain's head Node named on the Terminal Node's line and then used inside its subgraph,
 * a Floor Node shared across domains, and one Node whose name cannot be a filename as is.
 */
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

const SINL_FILE = "Limit of sin h over h as h approaches zero";

const SECTIONS = [
  "## In one sentence",
  "## Why you need this",
  "## The idea",
  "## Worked example",
  "## Common mistakes",
  "## Builds on",
  "## Required by",
  "## References",
];

/** Today as the scaffold writes it. Read before and after a run, so midnight cannot flake. */
const localDate = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Every markdown file in the vault, relative path to contents, the Anchor Graph Note aside. */
async function notesIn(vault) {
  const notes = new Map();
  for (const entry of await readdir(vault, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const path = join(entry.parentPath ?? entry.path, entry.name);
    const name = relative(vault, path).replaceAll("\\", "/");
    if (name.endsWith("Anchor Graph.md")) continue;
    notes.set(name, await readFile(path, "utf8"));
  }
  return notes;
}

const frontmatterOf = (contents) => /^---\n([\s\S]*?)\n---\n/.exec(contents)[1];
const requiresOf = (contents) =>
  [...frontmatterOf(contents).matchAll(/^ {2}- "\[\[(.*)\]\]"$/gm)].map((match) => match[1]);

async function scaffold(vault, ...nodes) {
  const before = localDate();
  const result = await runWiki(["scaffold", vault, ...nodes]);
  return { ...result, dates: new Set([before, localDate()]) };
}

test("scaffold creates one Note per Node, each under its domain directory", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  const { exitCode, stdout, stderr } = await scaffold(vault);

  assert.equal(exitCode, 0, stderr);
  assert.deepEqual([...(await notesIn(vault)).keys()].sort(), [
    "algebra/Algebra.md",
    "algebra/Equivalent fractions and cancellation.md",
    "algebra/Signed arithmetic and order of operations.md",
    "calculus/Derivative.md",
    `limits/${SINL_FILE}.md`,
    "limits/Limits.md",
  ]);
  assert.match(stdout, /created 6 Notes/);
});

test("a scaffolded Note carries the stub frontmatter and the eight-section skeleton", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  const { dates } = await scaffold(vault);
  const contents = await readFile(join(vault, "algebra", "Algebra.md"), "utf8");
  const today = /^created: (.*)$/m.exec(contents)[1];

  assert.ok(dates.has(today), `created ${today} is not today`);
  assert.equal(
    contents,
    `---
kind: concept
domain: algebra
requires:
  - "[[Equivalent fractions and cancellation]]"
  - "[[Signed arithmetic and order of operations]]"
status: stub
reviewed_by: none
created: ${today}
updated: ${today}
---

## In one sentence

## Why you need this

## The idea

## Worked example

## Common mistakes

## Builds on

<!-- generated:start builds-on -->
<!-- generated:end builds-on -->

## Required by

<!-- generated:start required-by -->
<!-- generated:end required-by -->

<!-- generated:start mini-map -->
<!-- generated:end mini-map -->

## References
`,
  );
});

test("every Note has the eight sections in spec order, with every generated block empty", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  await scaffold(vault);

  for (const [name, contents] of await notesIn(vault)) {
    const headings = contents.split("\n").filter((line) => line.startsWith("## "));
    assert.deepEqual(headings, SECTIONS, name);
    for (const block of ["builds-on", "required-by", "mini-map"]) {
      assert.ok(
        contents.includes(`<!-- generated:start ${block} -->\n<!-- generated:end ${block} -->`),
        `${name}: the ${block} block is not present and empty`,
      );
    }
  }
});

test("a Floor Node requires nothing, and the Terminal Node sits in calculus", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  await scaffold(vault);
  const floor = await readFile(join(vault, "algebra", "Signed arithmetic and order of operations.md"), "utf8");
  const terminal = await readFile(join(vault, "calculus", "Derivative.md"), "utf8");

  assert.match(frontmatterOf(floor), /^requires: \[\]$/m);
  assert.match(frontmatterOf(terminal), /^domain: calculus$/m);
  assert.deepEqual(requiresOf(terminal), ["Algebra", "Limits"]);
});

test("a name that cannot be a filename is spelled out, with the mathematical form in aliases", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  await scaffold(vault);
  const sinl = await readFile(join(vault, "limits", `${SINL_FILE}.md`), "utf8");
  const limits = await readFile(join(vault, "limits", "Limits.md"), "utf8");

  assert.match(
    frontmatterOf(sinl),
    /^aliases:\n {2}- "Limit of sin h \/ h as h approaches zero"$/m,
  );
  // A prerequisite link names the file, so it resolves rather than pointing at the alias.
  assert.deepEqual(requiresOf(limits), [SINL_FILE]);
  // A name that is already a filename gets no alias.
  assert.doesNotMatch(limits, /aliases/);
});

test("a second run writes nothing and reports no change", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  await scaffold(vault);
  const first = await notesIn(vault);
  const { exitCode, stdout } = await scaffold(vault);

  assert.equal(exitCode, 0);
  assert.deepEqual(await notesIn(vault), first);
  assert.match(stdout, /no change: all 6 Notes already exist/);
  assert.doesNotMatch(stdout, /created/);
});

test("a hand-edited Note is left byte-identical, and only the missing Note is recreated", async () => {
  const { vault } = await makeFixtureVault(GRAPH);
  await scaffold(vault);
  const edited = join(vault, "limits", "Limits.md");
  const handWritten = "---\nkind: concept\n---\n\nSomething a human wrote, with no skeleton at all.\n";
  await writeFile(edited, handWritten, "utf8");
  const deleted = join(vault, "algebra", "Algebra.md");
  const original = await readFile(deleted, "utf8");
  await rm(deleted);

  const { exitCode, stdout } = await scaffold(vault);

  assert.equal(exitCode, 0);
  assert.equal(await readFile(edited, "utf8"), handWritten);
  assert.equal(await readFile(deleted, "utf8"), original);
  assert.match(stdout, /created 1 Note\b/);
  assert.match(stdout, /algebra\/Algebra\.md/);
});

test("a Note already in another directory is left there, not created a second time", async () => {
  const { vault } = await makeFixtureVault(GRAPH);
  await mkdir(join(vault, "functions"), { recursive: true });
  const moved = join(vault, "functions", "Algebra.md");
  await writeFile(moved, "a Note a human moved\n", "utf8");

  const { exitCode, stdout } = await scaffold(vault);

  assert.equal(exitCode, 0);
  assert.equal(await readFile(moved, "utf8"), "a Note a human moved\n");
  assert.ok(!(await notesIn(vault)).has("algebra/Algebra.md"));
  assert.match(stdout, /functions\/Algebra\.md.*algebra/);
});

test("a Note whose filename differs only in case is the same Note, and is left alone", async () => {
  // One file on Windows and macOS, and one link target in Obsidian everywhere.
  const { vault } = await makeFixtureVault(GRAPH);
  await mkdir(join(vault, "algebra"), { recursive: true });
  const handMade = join(vault, "algebra", "algebra.md");
  await writeFile(handMade, "a Note a human made\n", "utf8");

  const { exitCode, stdout, stderr } = await scaffold(vault);

  assert.equal(exitCode, 0, stderr);
  assert.equal(await readFile(handMade, "utf8"), "a Note a human made\n");
  assert.match(stdout, /created 5 Notes, 1 already present/);
});

test("naming Nodes scaffolds only those Notes", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  const { exitCode, stderr } = await scaffold(vault, "Algebra", "Limit of sin h / h as h approaches zero");

  assert.equal(exitCode, 0, stderr);
  assert.deepEqual([...(await notesIn(vault)).keys()].sort(), [
    "algebra/Algebra.md",
    `limits/${SINL_FILE}.md`,
  ]);
});

test("scaffolding a Node absent from the Anchor Graph is refused, naming the Node, and writes nothing", async () => {
  const { vault } = await makeFixtureVault(GRAPH);

  const { exitCode, stderr } = await scaffold(vault, "Algebra", "Integration by parts");

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /"Integration by parts" is not a Node in the Anchor Graph/);
  assert.equal((await notesIn(vault)).size, 0);
});

test("a name with a character that has no spelling is refused, naming the Node", async () => {
  const { vault } = await makeFixtureVault(GRAPH.replace("Equivalent fractions and cancellation", "Fractions: equivalence"));

  const { exitCode, stderr } = await scaffold(vault);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /"Fractions: equivalence"/);
  assert.match(stderr, /":"/);
  assert.equal((await notesIn(vault)).size, 0);
});

test("a Node that belongs to no domain is refused, naming the Node", async () => {
  const { vault } = await makeFixtureVault(`${GRAPH}\n    D --> X["Stray"]\n    X --> AR`);

  const { exitCode, stderr } = await scaffold(vault);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /"Stray"/);
  assert.equal((await notesIn(vault)).size, 0);
});

test("a subgraph with no domain directory is refused, naming the subgraph", async () => {
  const { vault } = await makeFixtureVault(GRAPH.replace("subgraph LIM", "subgraph GEOM"));

  const { exitCode, stderr } = await scaffold(vault);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /GEOM/);
  assert.equal((await notesIn(vault)).size, 0);
});

test("an Anchor Graph that fails check's structural invariants is not scaffolded", async () => {
  const { vault } = await makeFixtureVault(`${GRAPH}\n    AR --> A`);

  const { exitCode, stderr } = await scaffold(vault);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /The Edge graph is acyclic/);
  assert.equal((await notesIn(vault)).size, 0);
});

test("the real Anchor Graph scaffolds 61 Notes across five domains, 9 of them Floor Notes, every link resolving", async () => {
  const { vault } = await makeFixtureRoot();
  await copyFile(REAL_ANCHOR_NOTE, join(vault, "Module 1 Anchor Graph.md"));

  const { exitCode, stdout, stderr } = await scaffold(vault);
  const notes = await notesIn(vault);

  assert.equal(exitCode, 0, stderr);
  assert.match(stdout, /created 61 Notes/);
  assert.equal(notes.size, 61);

  const perDomain = {};
  for (const name of notes.keys()) {
    const domain = name.split("/")[0];
    perDomain[domain] = (perDomain[domain] ?? 0) + 1;
  }
  assert.deepEqual(Object.keys(perDomain).sort(), [
    "algebra",
    "calculus",
    "functions",
    "limits",
    "trigonometry",
  ]);
  assert.equal(perDomain.calculus, 1);

  const floor = [...notes.values()].filter((contents) => /^requires: \[\]$/m.test(contents));
  assert.equal(floor.length, 9);

  const files = new Set([...notes.keys()].map((name) => name.split("/")[1].replace(/\.md$/, "")));
  for (const [name, contents] of notes) {
    assert.match(frontmatterOf(contents), new RegExp(`^domain: ${name.split("/")[0]}$`, "m"));
    for (const target of requiresOf(contents)) {
      assert.ok(files.has(target), `${name} requires [[${target}]], which is not a Note`);
    }
  }

  const aliased = [...notes.entries()].filter(([, contents]) => /^aliases:/m.test(contents));
  assert.deepEqual(aliased.map(([name]) => name).sort(), [
    "trigonometry/Limit of (cos h - 1) over h as h approaches zero.md",
    "trigonometry/Limit of sin h over h as h approaches zero.md",
  ]);
});

test("scaffold without a vault directory says one is required", async () => {
  const { exitCode, stderr } = await runWiki(["scaffold"]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /vault directory/i);
});

test("an option scaffold does not have is named rather than read as a Node", async () => {
  const { exitCode, stderr } = await runWiki(["scaffold", "wiki", "--force"]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /takes no options, given "--force"/);
});

test("--help lists scaffold", async () => {
  const { stdout } = await runWiki(["--help"]);

  assert.match(stdout, /scaffold <vault directory>/);
});
