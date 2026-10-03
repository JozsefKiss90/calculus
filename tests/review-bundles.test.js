// Ticket 16: `generate --review <Note name>` writes one Review Bundle beside the vault, for the
// Correctness Reviewer. It holds the whole Note, its prerequisites' Notes whole, the deeper
// Nodes it may build on and every Node it may not, and its Layer siblings whole, so the
// reviewer sees what each author could not. One Bundle is written out whole and compared byte
// for byte; the others are held to the cases a reviewer must be able to tell apart.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { capture, makeScaffoldedVault, runWiki } from "./helpers/vault.js";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));

// Layer 0: AR and FR, the Floor. Layer 1: Algebra, SINL and APPROACH. Layer 2: Limits.
// Layer 3: Derivative. Every Note is drafted but FR, which stays a stub.
const GRAPH = `flowchart TD
    D["Derivative"] --> A["Algebra"]
    D --> L["Limits"]
    L --> A

    subgraph ALG["Algebra"]
        A --> FR["Equivalent fractions and cancellation"]
        A --> AR["Signed arithmetic and order of operations"]
    end

    subgraph LIM["Limits"]
        L --> SINL["Limit of sin h / h as h approaches zero"]
        L --> APPROACH["Approaching a value"]
        SINL --> AR
        APPROACH --> AR
    end`;

const ARITHMETIC = "algebra/Signed arithmetic and order of operations.md";
const FRACTIONS = "algebra/Equivalent fractions and cancellation.md";
const ALGEBRA = "algebra/Algebra.md";
const LIMITS = "limits/Limits.md";
const SINL = "limits/Limit of sin h over h as h approaches zero.md";
const APPROACH = "limits/Approaching a value.md";
const DERIVATIVE = "calculus/Derivative.md";

const CONVENTIONS = `---
kind: reference
domain: wiki
requires: []
status: drafted
reviewed_by: none
created: 2026-10-01
updated: 2026-10-01
---

## In one sentence

Which symbol this fixture Wiki uses for each idea.
`;

const LIMITS_SOURCE = `---
kind: source
domain: sources
requires: []
status: drafted
reviewed_by: none
created: 2026-10-01
updated: 2026-10-01
source_file: raw/limits.html
source_type: textbook
date_ingested: 2026-10-01
tags:
  - limits
---

## In one sentence

A limits text, a fixture reference about limits.
`;

const read = (vault, path) => readFile(join(vault, path), "utf8");

async function editNote(vault, path, change) {
  await writeFile(join(vault, path), change(await read(vault, path)), "utf8");
}

/** Draft a stub: give it a summary and some prose, and set it to status: drafted. */
const draft = (sentence, idea) => (note) =>
  note
    .replace("status: stub", "status: drafted")
    .replace("## In one sentence\n", `## In one sentence\n\n${sentence}\n`)
    .replace("## The idea\n", `## The idea\n\n${idea}\n`);

/** A scaffolded, generated fixture with every Note but FR drafted, a notation authority and a limits source. */
async function reviewableVault() {
  const fixture = await makeScaffoldedVault(GRAPH);
  const { vault } = fixture;
  await writeFile(join(vault, "Conventions.md"), CONVENTIONS, "utf8");
  await mkdir(join(vault, "sources"));
  await writeFile(join(vault, "sources/A limits text.md"), LIMITS_SOURCE, "utf8");
  await editNote(vault, ARITHMETIC, draft("Signed arithmetic is adding and multiplying with signs.", "ARITHMETIC PROSE."));
  await editNote(vault, ALGEBRA, draft("Algebra is arithmetic with letters.", "ALGEBRA PROSE."));
  await editNote(vault, SINL, draft("The ratio sin h over h tends to 1.", "SINL PROSE."));
  await editNote(vault, APPROACH, draft("A function can approach a value.", "APPROACH PROSE."));
  await editNote(vault, LIMITS, draft("A limit is the value a function approaches.", "LIMITS PROSE."));
  await editNote(vault, DERIVATIVE, draft("A derivative is a limit of slopes.", "DERIVATIVE PROSE."));
  assert.equal((await runWiki(["generate", vault])).exitCode, 0);
  return fixture;
}

const review = (vault, name) => runWiki(["generate", vault, "--review", name]);
const readBundle = (root, name) => readFile(join(root, ".review-bundles", `${name}.md`), "utf8");

const fenced = (text) => `\`\`\`\`markdown\n${text.replace(/\r\n/g, "\n").replace(/\n*$/, "\n")}\`\`\`\``;

/** Every file under a directory, relative path to contents. */
async function snapshot(dir) {
  const files = new Map();
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath ?? entry.path, entry.name);
    files.set(relative(dir, path).replaceAll("\\", "/"), await readFile(path, "utf8"));
  }
  return files;
}

/** The text of one `##` section of a Bundle, up to the next one outside a fence. */
function section(bundle, heading) {
  const lines = bundle.split("\n");
  const out = [];
  let inside = false;
  let fence = null;
  for (const line of lines) {
    const opener = /^(`{3,})/.exec(line)?.[1];
    if (fence === null && opener && line.length > opener.length) fence = opener;
    else if (fence !== null && line === fence) fence = null;
    else if (fence === null && line.startsWith("## ")) {
      if (inside) break;
      inside = line === `## ${heading}`;
      continue;
    }
    if (inside) out.push(line);
  }
  return out.join("\n").trim();
}

test("generate --review writes one Bundle beside the vault, and nothing into it", async () => {
  const { root, vault } = await reviewableVault();
  const before = await snapshot(vault);

  const { exitCode, stdout } = await review(vault, "Limits");

  assert.equal(exitCode, 0, stdout);
  assert.match(stdout, /wrote \.review-bundles\/Limits\.md, beside the vault/);
  assert.deepEqual([...(await snapshot(join(root, ".review-bundles"))).keys()], ["Limits.md"]);
  assert.deepEqual(await snapshot(vault), before, "generate --review wrote into the vault");
});

test("a Bundle holds the Note, its prerequisites' Notes, the Nodes below and outside it, its Layer siblings, the notation authority and its sources", async () => {
  const { root, vault } = await reviewableVault();
  await review(vault, "Limit of sin h over h as h approaches zero");

  const bundle = await readBundle(root, "Limit of sin h over h as h approaches zero");

  const expected = [
    "# Review Bundle: Limit of sin h over h as h approaches zero",
    "",
    "## Note",
    "",
    "`wiki/limits/Limit of sin h over h as h approaches zero.md`, a limits Note in Layer 1, as it stands:",
    "",
    fenced(await read(vault, SINL)),
    "",
    "## Prerequisites",
    "",
    "Each Note this one requires, whole. What they teach, the Note may use without teaching it again.",
    "",
    "`wiki/algebra/Signed arithmetic and order of operations.md`:",
    "",
    fenced(await read(vault, ARITHMETIC)),
    "",
    "## Further below",
    "",
    "Nothing: no prerequisite builds on another Node.",
    "",
    "## Not taught before it",
    "",
    "Every other Node of the Module. None is taught before this Note, so the Note may not use the idea any of them teaches, except to point to it as a marked Cross-reference.",
    "",
    "- Algebra",
    "- Approaching a value",
    "- Derivative",
    "- Equivalent fractions and cancellation",
    "- Limits",
    "",
    "## Layer siblings",
    "",
    "The other Notes in Layer 1, written alongside this one by authors who could not see each other. Each written one, whole:",
    "",
    "`wiki/algebra/Algebra.md`:",
    "",
    fenced(await read(vault, ALGEBRA)),
    "",
    "`wiki/limits/Approaching a value.md`:",
    "",
    fenced(await read(vault, APPROACH)),
    "",
    "## Notation authority",
    "",
    "`wiki/Conventions.md`, whole:",
    "",
    fenced(CONVENTIONS),
    "",
    "## Sources",
    "",
    "The source Notes for the limits domain, whole:",
    "",
    "`wiki/sources/A limits text.md`:",
    "",
    fenced(LIMITS_SOURCE),
    "",
  ].join("\n");

  assert.equal(bundle, expected);
});

test("a Bundle names every Node below its prerequisites, and no Node it requires is called untaught", async () => {
  const { root, vault } = await reviewableVault();
  await review(vault, "Limits");

  const bundle = await readBundle(root, "Limits");

  assert.equal(
    section(bundle, "Further below"),
    "Every Node those prerequisites build on in turn, down to the Floor. Each is taught before this Note, so the Note may use it too.\n\n" +
      "- **Equivalent fractions and cancellation** — *no one-sentence summary written yet*\n" +
      "- **Signed arithmetic and order of operations** — Signed arithmetic is adding and multiplying with signs.",
  );
  assert.match(section(bundle, "Not taught before it"), /\n\n- Derivative$/);
  assert.equal(section(bundle, "Layer siblings"), "No other Note is in Layer 2.");
  for (const prose of ["ALGEBRA PROSE.", "SINL PROSE.", "APPROACH PROSE."]) {
    assert.ok(section(bundle, "Prerequisites").includes(prose), `the prerequisites lack "${prose}"`);
  }
  assert.ok(!bundle.includes("DERIVATIVE PROSE."), "a dependent's prose is in the Bundle");
});

test("a Note not yet written is named, never pasted, whether prerequisite or sibling", async () => {
  const { root, vault } = await reviewableVault();
  await review(vault, "Algebra");
  await review(vault, "Signed arithmetic and order of operations");

  const algebra = await readBundle(root, "Algebra");
  assert.match(section(algebra, "Prerequisites"), /\n\nNot yet written: \*\*Equivalent fractions and cancellation\*\*\.$/);
  assert.ok(!algebra.includes(await read(vault, FRACTIONS)), "a stub's skeleton is in the Bundle");

  const floor = await readBundle(root, "Signed arithmetic and order of operations");
  assert.equal(section(floor, "Layer siblings"), "Not yet written: **Equivalent fractions and cancellation**.");
});

test("a Floor Note's Bundle says it has no prerequisites and that no sources apply", async () => {
  const { root, vault } = await reviewableVault();
  await review(vault, "Signed arithmetic and order of operations");

  const bundle = await readBundle(root, "Signed arithmetic and order of operations");

  assert.equal(
    section(bundle, "Prerequisites"),
    "None: this is a Floor Node. It assumes only the Module's Floor, 8th-grade mathematics, and teaches the rest itself.",
  );
  assert.equal(section(bundle, "Further below"), "Nothing: no prerequisite builds on another Node.");
  // The other Floor Node is the Floor too: knowledge the Module assumes, so not untaught.
  assert.equal(
    section(bundle, "Not taught before it"),
    "Every Node of the Module above the Floor. None is taught before this Note, so the Note may not use the idea any of them teaches, except to point to it as a marked Cross-reference. " +
      "The other Floor Nodes are not listed: like this one, each is 8th-grade knowledge the Module assumes, so this Note may use their ideas.\n\n" +
      "- Algebra\n- Approaching a value\n- Derivative\n- Limit of sin h over h as h approaches zero\n- Limits",
  );
  assert.equal(
    section(bundle, "Sources"),
    "No sources apply. This is a Floor Node: its claims are 8th-grade knowledge the Module assumes, and need no citation.",
  );
});

test("a Bundle for a domain with no source Note yet says so", async () => {
  const { root, vault } = await reviewableVault();
  await review(vault, "Algebra");

  assert.equal(
    section(await readBundle(root, "Algebra"), "Sources"),
    "No source Note exists yet for the algebra domain, so a claim in this Note that needs a source has none to trace to.",
  );
});

test("the Note is named as a wikilink names it, ignoring case", async () => {
  const { root, vault } = await reviewableVault();

  const { exitCode } = await review(vault, "limits");

  assert.equal(exitCode, 0);
  assert.match(await readBundle(root, "Limits"), /^# Review Bundle: Limits\n/);
});

test("a stub, a Note that does not exist and a vault with no notation authority get no Bundle", async () => {
  const { root, vault } = await reviewableVault();

  const stub = await review(vault, "Equivalent fractions and cancellation");
  assert.equal(stub.exitCode, 2);
  assert.match(stub.stderr, /Equivalent fractions and cancellation\.md is still a stub: there is nothing to review/);

  const missing = await review(vault, "Continuity");
  assert.equal(missing.exitCode, 2);
  assert.match(missing.stderr, /there is no concept Note named "Continuity"/);

  await assert.rejects(readdir(join(root, ".review-bundles")));

  const bare = await makeScaffoldedVault(GRAPH);
  await editNote(bare.vault, LIMITS, draft("A limit is the value a function approaches.", ""));
  const noConventions = await review(bare.vault, "Limits");
  assert.equal(noConventions.exitCode, 2);
  assert.match(noConventions.stderr, /Conventions\.md/);
  await assert.rejects(readdir(join(bare.root, ".review-bundles")));
});

test("--review needs a Note name", async () => {
  const { vault } = await reviewableVault();

  for (const args of [["--review"], ["--review", "--layer", "0"]]) {
    const { exitCode, stderr } = await runWiki(["generate", vault, ...args]);
    assert.equal(exitCode, 2, args.join(" "));
    assert.match(stderr, /--review needs the name of the Note to review/);
  }
});

test("git ignores the Bundle directory, so no Bundle is ever committed", async () => {
  const { exitCode, stdout } = await capture("git", ["check-ignore", ".review-bundles/Any Note.md"], { cwd: REPO_ROOT });

  assert.equal(exitCode, 0);
  assert.match(stdout, /\.review-bundles/);
});
