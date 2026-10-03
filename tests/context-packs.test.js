// Ticket 15: `generate --layer <N>` emits one Context Pack per Node in a computed Layer, into
// a transient directory beside the vault and never inside it. A Pack carries exactly what
// ADR-0005 and the ticket list, and nothing else, so the expected Pack below is written out
// whole and compared byte for byte; the absence tests then name the likeliest leaks.

import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { capture, makeFixtureRoot, makeScaffoldedVault, runWiki } from "./helpers/vault.js";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const HOUSE_STYLE = join(REPO_ROOT, "docs", "house-style.md");
const CATALOGUE = join(REPO_ROOT, "docs", "archetype-catalogue.md");

// Layer 0: AR and FR, the Floor. Layer 1: Algebra and SINL. Layer 2: Limits. Layer 3: Derivative.
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
        SINL --> AR
    end`;

const ARITHMETIC = "algebra/Signed arithmetic and order of operations.md";
const FRACTIONS = "algebra/Equivalent fractions and cancellation.md";
const ALGEBRA = "algebra/Algebra.md";
const LIMITS = "limits/Limits.md";
const SINL = "limits/Limit of sin h over h as h approaches zero.md";

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

## Entries

### Limit

- **This Wiki:** $\\lim_{x \\to a} f(x)$.
- **Elsewhere:** none known.
`;

const source = (title, tag) => `---
kind: source
domain: sources
requires: []
status: drafted
reviewed_by: none
created: 2026-10-01
updated: 2026-10-01
source_file: raw/${tag}.html
source_type: textbook
date_ingested: 2026-10-01
tags:
  - ${tag}
---

## In one sentence

${title}, a fixture reference about ${tag}.
`;

const LIMITS_SOURCE = "sources/A limits text.md";
const TRIG_SOURCE = "sources/A trigonometry text.md";

const read = (vault, path) => readFile(join(vault, path), "utf8");

async function editNote(vault, path, change) {
  await writeFile(join(vault, path), change(await read(vault, path)), "utf8");
}

const summarise = (sentence, idea = "") => (note) =>
  note.replace("## In one sentence\n", `## In one sentence\n\n${sentence}\n`).replace("## The idea\n", `## The idea\n\n${idea}\n`);

/** A scaffolded, generated fixture with a notation authority, two source Notes and a few summaries. */
async function packedVault() {
  const fixture = await makeScaffoldedVault(GRAPH);
  const { vault } = fixture;
  await writeFile(join(vault, "Conventions.md"), CONVENTIONS, "utf8");
  await mkdir(join(vault, "sources"));
  await writeFile(join(vault, LIMITS_SOURCE), source("A limits text", "limits"), "utf8");
  await writeFile(join(vault, TRIG_SOURCE), source("A trigonometry text", "trigonometry"), "utf8");
  await editNote(vault, ARITHMETIC, summarise("Signed arithmetic is adding and multiplying with signs.", "PREREQUISITE PROSE STAYS OUT."));
  await editNote(vault, FRACTIONS, summarise("Two fractions are equal when one scales to the other."));
  await editNote(vault, LIMITS, summarise("A limit is the value a function approaches."));
  assert.equal((await runWiki(["generate", vault])).exitCode, 0);
  return fixture;
}

const generateLayer = (vault, layer) => runWiki(["generate", vault, "--layer", String(layer)]);

const packDir = (root, layer) => join(root, ".context-packs", `layer-${layer}`);
const readPack = (root, layer, name) => readFile(join(packDir(root, layer), `${name}.md`), "utf8");

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

/** The `##` headings of a Pack that sit outside every fence: its sections. */
function sections(pack) {
  const headings = [];
  let fence = null;
  for (const line of pack.split("\n")) {
    const opener = /^(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence === null && opener) fence = opener;
    else if (fence !== null && line === fence) fence = null;
    else if (fence === null && line.startsWith("## ")) headings.push(line.slice(3));
  }
  return headings;
}

/** The Archetype catalogue as names and one-liners, read from the catalogue itself. */
async function catalogueLines() {
  const text = (await readFile(CATALOGUE, "utf8")).replace(/\r\n/g, "\n");
  return [...text.matchAll(/^### `([^`]+)`\n\n\*\*One-liner:\*\* (.+)$/gm)].map(([, name, line]) => `- \`${name}\` — ${line}`);
}

const fenced = (text) => `\`\`\`\`markdown\n${text.replace(/\r\n/g, "\n").replace(/\n*$/, "\n")}\`\`\`\``;

test("generate --layer emits one Pack per Node in that computed Layer, beside the vault and never in it", async () => {
  const { root, vault } = await packedVault();
  const before = await snapshot(vault);

  const { exitCode, stdout } = await generateLayer(vault, 1);

  assert.equal(exitCode, 0, stdout);
  assert.deepEqual([...(await snapshot(packDir(root, 1))).keys()].sort(), [
    "Algebra.md",
    "Limit of sin h over h as h approaches zero.md",
  ]);
  assert.match(stdout, /Layer 1 of 4 Layers: wrote 2 Context Packs to \.context-packs\/layer-1, beside the vault/);
  // The one change in the vault is the log recording the Layer dispatched (ticket 17).
  const after = await snapshot(vault);
  assert.notEqual(after.get("log.md"), before.get("log.md"));
  after.delete("log.md");
  before.delete("log.md");
  assert.deepEqual(after, before, "generate --layer wrote a Pack into the vault");
});

test("a Pack holds exactly the Node, its skeleton, its neighbours' one-liners, the catalogue, the house style, the notation authority and its sources", async () => {
  const { root, vault } = await packedVault();
  await generateLayer(vault, 1);

  const pack = await readPack(root, 1, "Limit of sin h over h as h approaches zero");

  const expected = [
    "# Context Pack: Limit of sin h over h as h approaches zero",
    "",
    "## Node",
    "",
    "- **Name:** Limit of sin h over h as h approaches zero",
    "- **Domain:** limits",
    "",
    "## Skeleton",
    "",
    "The Note you write is `wiki/limits/Limit of sin h over h as h approaches zero.md`. As it stands:",
    "",
    fenced(await read(vault, SINL)),
    "",
    "## Builds on",
    "",
    "- **Signed arithmetic and order of operations** — Signed arithmetic is adding and multiplying with signs.",
    "",
    "## Required by",
    "",
    "- **Limits** — A limit is the value a function approaches.",
    "",
    "## Archetype catalogue",
    "",
    ...(await catalogueLines()),
    "",
    "## House style",
    "",
    fenced(await readFile(HOUSE_STYLE, "utf8")),
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
    fenced(source("A limits text", "limits")),
    "",
  ].join("\n");

  assert.equal(pack, expected);
  assert.deepEqual(sections(pack), [
    "Node",
    "Skeleton",
    "Builds on",
    "Required by",
    "Archetype catalogue",
    "House style",
    "Notation authority",
    "Sources",
  ]);
});

test("a Pack leaves out everything else: siblings, the Anchor Graph, prerequisites' prose, Layer numbers and other domains' sources", async () => {
  const { root, vault } = await packedVault();
  await generateLayer(vault, 1);

  const pack = await readPack(root, 1, "Limit of sin h over h as h approaches zero");

  for (const absent of [
    "Algebra", // its Layer sibling, and no neighbour of it
    "Equivalent fractions and cancellation",
    "Derivative",
    "Module 1 Anchor Graph",
    "frozen inventory",
    "PREREQUISITE PROSE STAYS OUT.",
    "A trigonometry text",
    "Layer",
    "**Serves:**",
    "| Parameter |",
  ]) {
    assert.ok(!pack.includes(absent), `the Pack holds "${absent}"`);
  }
});

test("a Pack carries the house style and the notation authority verbatim, not summarised", async () => {
  const { root, vault } = await packedVault();
  await generateLayer(vault, 0);

  const pack = await readPack(root, 0, "Signed arithmetic and order of operations");

  assert.ok(pack.includes((await readFile(HOUSE_STYLE, "utf8")).replace(/\r\n/g, "\n")));
  assert.ok(pack.includes(CONVENTIONS));
});

test("the sources section says which case it means: none apply to a Floor Node, none exist yet for a domain", async () => {
  const { root, vault } = await packedVault();
  await generateLayer(vault, 0);
  await generateLayer(vault, 1);

  const floor = (await readPack(root, 0, "Signed arithmetic and order of operations")).split("## Sources\n")[1];
  assert.equal(
    floor,
    "\nNo sources apply. This is a Floor Node: its claims are 8th-grade knowledge the Module assumes, and need no citation.\n",
  );

  const algebra = (await readPack(root, 1, "Algebra")).split("## Sources\n")[1];
  assert.equal(
    algebra,
    "\nNo source Note exists yet for the algebra domain. Claims in this Note that need a source have none to cite: " +
      "report each one when you hand the Note back, rather than writing it uncited.\n",
  );
});

test("a Floor Node in a domain that has sources is still told no sources apply", async () => {
  const fixture = await packedVault();
  // The real Module's Decimals, ordering, and number lines: a Floor Node in limits.
  await editNote(fixture.vault, LIMITS_SOURCE, (note) => note.replace("  - limits\n", "  - limits\n  - algebra\n"));

  await generateLayer(fixture.vault, 0);

  const pack = await readPack(fixture.root, 0, "Equivalent fractions and cancellation");
  assert.match(pack, /\nNo sources apply\. This is a Floor Node/);
  assert.ok(!pack.includes("A limits text"));
});

test("a neighbour with no one-sentence summary yet is named as such", async () => {
  const { root, vault } = await packedVault();
  await generateLayer(vault, 0);

  const pack = await readPack(root, 0, "Signed arithmetic and order of operations");
  assert.match(
    pack,
    /## Builds on\n\nNothing: this is a Floor Node, knowledge the Module assumes\.\n\n## Required by\n\n- \*\*Algebra\*\* — \*no one-sentence summary written yet\*\n- \*\*Limit of sin h over h as h approaches zero\*\* — \*no one-sentence summary written yet\*\n\n/,
  );
});

test("a run replaces the Layer's earlier Packs, so a stale Pack never survives", async () => {
  const { root, vault } = await packedVault();
  await generateLayer(vault, 0);
  await writeFile(join(packDir(root, 0), "A Node no longer in this Layer.md"), "stale", "utf8");

  await generateLayer(vault, 0);

  assert.deepEqual([...(await snapshot(packDir(root, 0))).keys()].sort(), [
    "Equivalent fractions and cancellation.md",
    "Signed arithmetic and order of operations.md",
  ]);
});

test("a Layer the graph does not have is refused, naming how many it has", async () => {
  const { vault } = await packedVault();

  const { exitCode, stderr } = await generateLayer(vault, 4);

  assert.equal(exitCode, 2);
  assert.match(stderr, /there is no Layer 4: the graph has 4 Layers, 0 to 3/);
});

test("--layer needs a whole number", async () => {
  const { vault } = await packedVault();

  for (const args of [["--layer"], ["--layer", "one"], ["--layer", "-1"], ["--layer", "1.5"]]) {
    const { exitCode, stderr } = await runWiki(["generate", vault, ...args]);
    assert.equal(exitCode, 2, args.join(" "));
    assert.match(stderr, /--layer needs a Layer number/);
  }
});

test("a vault with no notation authority cannot have a Pack, and gets none", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);

  const { exitCode, stderr } = await generateLayer(fixture.vault, 0);

  assert.equal(exitCode, 2);
  assert.match(stderr, /Conventions\.md/);
  await assert.rejects(readdir(packDir(fixture.root, 0)));
});

test("on the real vault the Layer count is 13 and Layer 0 is nine Packs", async () => {
  const { root, vault } = await makeFixtureRoot();
  await cp(join(REPO_ROOT, "wiki"), vault, { recursive: true });

  const { exitCode, stdout } = await generateLayer(vault, 0);

  assert.equal(exitCode, 0, stdout);
  assert.match(stdout, /Layer 0 of 13 Layers: wrote 9 Context Packs/);
  assert.deepEqual([...(await snapshot(packDir(root, 0))).keys()].sort(), [
    "Coordinates, tables, and plotting.md",
    "Decimals, ordering, and number lines.md",
    "Division restrictions.md",
    "Equivalent fractions and cancellation.md",
    "Factors and multiples.md",
    "Inputs, outputs, and composition.md",
    "Inverse operations.md",
    "Multiplication, division, squares, and roots.md",
    "Signed arithmetic and order of operations.md",
  ]);
});

test("git ignores the Pack directory, so no Pack is ever committed", async () => {
  const { exitCode, stdout } = await capture("git", ["check-ignore", ".context-packs/layer-0/Any Node.md"], { cwd: REPO_ROOT });

  assert.equal(exitCode, 0);
  assert.match(stdout, /\.context-packs/);
});
