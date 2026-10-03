// Ticket 17: the three human-facing views `generate` writes — `index.md`, the Graph Health
// Dashboard and `log.md` — all from the computation `check` gates on. Every fixture is a
// vault `scaffold` has just filled.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { checkVault, makeScaffoldedVault, runWiki } from "./helpers/vault.js";

/** Four Layers: two Floor Nodes, two Nodes on Layer 1, Limits on 2 and Derivative on 3. */
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

const INDEX = "index.md";
const LOG = "log.md";
const DASHBOARD = "observability/Graph Health Dashboard.md";

const generate = (vault, ...options) => runWiki(["generate", vault, ...options]);

/** Today in local time, the date `generate` writes into the log. */
function today() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const read = (vault, path) => readFile(join(vault, path), "utf8");

async function editNote(vault, path, change) {
  await writeFile(join(vault, path), change(await read(vault, path)), "utf8");
}

/** A Note moved to a status, with the one-sentence summary a written Note must have. */
const setStatus = (status, reviewedBy = "none") => (note) =>
  note
    .replace(/^status: .*$/m, `status: ${status}`)
    .replace(/^reviewed_by: .*$/m, `reviewed_by: ${reviewedBy}`)
    .replace("## In one sentence\n", "## In one sentence\n\nA sentence.\n");

/** Every file in the vault, relative path to contents. */
async function snapshot(vault) {
  const files = new Map();
  for (const entry of await readdir(vault, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath ?? entry.path, entry.name);
    files.set(relative(vault, path).replaceAll("\\", "/"), await readFile(path, "utf8"));
  }
  return files;
}

const changed = (before, after) =>
  [...new Set([...before.keys(), ...after.keys()])].filter((path) => before.get(path) !== after.get(path)).sort();

/** Markdown with its backslash escapes undone: the text a reader sees. */
const unescape = (text) => text.replace(/\\(.)/g, "$1");

/** The text of one `##` section, up to the next `##` heading. */
function section(markdown, heading) {
  const match = new RegExp(`^## ${heading}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m").exec(markdown);
  assert.ok(match, `no ## ${heading} section`);
  return match[1];
}

/** The rows of the first table in a section, header and separator dropped, each as its cells. */
function table(markdown, heading) {
  const rows = section(markdown, heading)
    .split("\n")
    .filter((line) => line.startsWith("|"));
  return rows.slice(2).map((row) =>
    row
      .slice(1, -1)
      .split(/(?<!\\)\|/)
      .map((cell) => unescape(cell.trim()).replace(/^\*\*(.*)\*\*$/, "$1")),
  );
}

/** The log's entries, each from its `##` heading to the next. */
const entries = (log) => log.split(/^(?=## )/m).slice(1).map((entry) => entry.replace(/<!--[\s\S]*$/, "").trim());

test("generate writes the index, the dashboard and the log, and a second run on an unchanged vault changes nothing", async () => {
  const { vault } = await makeScaffoldedVault(GRAPH);

  const first = await generate(vault);
  assert.equal(first.exitCode, 0, first.stdout + first.stderr);
  const before = await snapshot(vault);
  for (const path of [INDEX, LOG, DASHBOARD]) assert.ok(before.has(path), `generate did not write ${path}`);

  const second = await generate(vault);

  assert.equal(second.exitCode, 0);
  assert.deepEqual(changed(before, await snapshot(vault)), []);
});

test("index.md and log.md carry no frontmatter and are not Notes; the dashboard is an observability Note that holds every invariant", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  await generate(fixture.vault);

  for (const path of [INDEX, LOG]) assert.ok(!(await read(fixture.vault, path)).startsWith("---"), `${path} has frontmatter`);
  assert.match(await read(fixture.vault, DASHBOARD), /^---\nkind: observability\ndomain: observability\n/);

  const { exitCode, report, stdout } = await checkVault(fixture);
  assert.equal(exitCode, 0, stdout);
  // The Anchor Graph Note, six concept Notes and the dashboard: index.md and log.md count for nothing.
  assert.deepEqual(report.notes, { notes: 8, conceptNotes: 6 });
});

test("every number on the dashboard is the report's, after the vault changes", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  const { vault } = fixture;
  await generate(vault);
  await editNote(vault, FRACTIONS, setStatus("drafted"));
  await editNote(vault, ARITHMETIC, setStatus("reviewed", "human"));
  await editNote(vault, ALGEBRA, setStatus("drafted"));
  await editNote(vault, ALGEBRA, (note) => note.replace("## The idea\n", "## The idea\n\nSee [[No such Note]].\n"));

  await generate(vault);
  const { report } = await checkVault(fixture);
  const dashboard = (await read(vault, DASHBOARD)).replace(/\r\n/g, "\n");

  // The dashboard's own links all resolve: the broken one is the Note's, and only it.
  assert.equal(report.metrics.find((metric) => metric.id === "broken-wikilinks").count, 1);
  assert.equal(report.status, "fail");

  assert.deepEqual(
    table(dashboard, "Metrics"),
    report.metrics.map((metric) => [
      metric.title,
      metric.level,
      metric.level === "skipped"
        ? "not measured"
        : metric.unit === "percent"
          ? `${metric.count} of ${metric.of} written ${metric.of === 1 ? "Note" : "Notes"} (${metric.percent}%)`
          : String(metric.count),
      metric.bands.green,
      metric.bands.yellow,
      metric.bands.red,
    ]),
  );
  assert.deepEqual(
    table(dashboard, "Invariants"),
    report.invariants.map((invariant) => [String(invariant.id), invariant.title, invariant.status, String(invariant.failures.length)]),
  );

  const { stub, drafted, reviewed } = report.progress.status;
  assert.deepEqual(table(dashboard, "The Module at a glance").at(-1), ["All", String(report.progress.conceptNotes), String(stub), String(drafted), String(reviewed)]);

  const { metrics } = report.summary;
  assert.match(
    section(dashboard, "Verdict"),
    new RegExp(`check fails.*metrics ${metrics.green} green, ${metrics.yellow} yellow, ${metrics.red} red`),
  );
});

test("the dashboard shows the stub / drafted / reviewed breakdown by Layer and across the Module", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  const { vault } = fixture;
  await editNote(vault, FRACTIONS, setStatus("drafted"));
  await editNote(vault, ARITHMETIC, setStatus("reviewed", "human"));
  await editNote(vault, ALGEBRA, setStatus("drafted", "agent"));

  await generate(vault);
  const dashboard = (await read(vault, DASHBOARD)).replace(/\r\n/g, "\n");

  assert.deepEqual(table(dashboard, "The Module at a glance"), [
    ["0", "2", "0", "1", "1"],
    ["1", "2", "1", "1", "0"],
    ["2", "1", "1", "0", "0"],
    ["3", "1", "1", "0", "0"],
    ["All", "6", "3", "2", "1"],
  ]);
  assert.match(section(dashboard, "The Module at a glance"), /1 Note is reviewed by an agent and waits for human sign-off/);

  const { report } = await checkVault(fixture);
  assert.deepEqual(report.progress, {
    conceptNotes: 6,
    status: { stub: 3, drafted: 2, reviewed: 1 },
    reviewedBy: { none: 4, agent: 1, human: 1 },
    layers: [
      { layer: 0, notes: 2, stub: 0, drafted: 1, reviewed: 1 },
      { layer: 1, notes: 2, stub: 1, drafted: 1, reviewed: 0 },
      { layer: 2, notes: 1, stub: 1, drafted: 0, reviewed: 0 },
      { layer: 3, notes: 1, stub: 1, drafted: 0, reviewed: 0 },
    ],
  });
});

test("a broken link the dashboard reports is named, never linked", async () => {
  const { vault } = await makeScaffoldedVault(GRAPH);
  await editNote(vault, ALGEBRA, (note) => note.replace("## The idea\n", "## The idea\n\nSee [[No such Note]].\n"));

  await generate(vault);
  const dashboard = await read(vault, DASHBOARD);

  assert.ok(!dashboard.includes("[[No such Note]]"), "the dashboard links the broken target");
  assert.match(dashboard, /No such Note/);
});

test("a hand edit to the index or the dashboard is overwritten by the next run", async () => {
  const { vault } = await makeScaffoldedVault(GRAPH);
  await generate(vault);
  const generated = await snapshot(vault);
  await editNote(vault, DASHBOARD, (text) => text.replace("| All |", "| All (hand-counted) |"));
  await editNote(vault, INDEX, (text) => `${text}\n- [[A Note I listed by hand]]\n`);

  await generate(vault);

  assert.deepEqual(changed(generated, await snapshot(vault)), []);
});

test("the index lists every concept Note by Layer, Floor first, with its status and summary", async () => {
  const { vault } = await makeScaffoldedVault(GRAPH);
  await editNote(vault, FRACTIONS, setStatus("drafted"));

  await generate(vault);
  const index = (await read(vault, INDEX)).replace(/\r\n/g, "\n");

  assert.match(index, /^# /);
  assert.match(index, /\[\[Module 1 Anchor Graph\]\]/);
  assert.match(index, /\[\[Graph Health Dashboard\]\]/);
  assert.match(index, /\[\[log\]\]/);
  assert.match(index, /6 concept Notes: 5 stub, 1 drafted, 0 reviewed/);
  const layers = [...index.matchAll(/^### Layer (\d+)/gm)].map((match) => Number(match[1]));
  assert.deepEqual(layers, [0, 1, 2, 3]);
  assert.match(section(index, "Learning sequence"), /### Layer 0[^#]*- \[\[Equivalent fractions and cancellation\]\] — A sentence\. \*drafted\*\n- \[\[Signed arithmetic and order of operations\]\] \*stub\*\n/);
});

test("the log's first entry records the date and where the Module stands", async () => {
  const { vault } = await makeScaffoldedVault(GRAPH);

  await generate(vault);
  const log = (await read(vault, LOG)).replace(/\r\n/g, "\n");

  assert.match(log, /^# Log\n/);
  const [entry, ...rest] = entries(log);
  assert.deepEqual(rest, []);
  assert.match(entry, new RegExp(`^## ${today()} · first entry\\n`));
  assert.match(entry, /6 concept Notes: 6 stub, 0 drafted, 0 reviewed/);
  assert.match(entry, /- Broken wikilinks: green/);
});

test("a run that moves Notes appends one entry: the date, the Layer, each transition and the report's metric levels", async () => {
  const fixture = await makeScaffoldedVault(GRAPH);
  const { vault } = fixture;
  await generate(vault);
  await editNote(vault, FRACTIONS, setStatus("drafted"));
  await editNote(vault, ARITHMETIC, setStatus("drafted", "agent"));

  await generate(vault);
  const log = (await read(vault, LOG)).replace(/\r\n/g, "\n");
  const { report } = await checkVault(fixture);

  const all = entries(log);
  assert.equal(all.length, 2);
  const entry = all[1];
  assert.match(entry, new RegExp(`^## ${today()} · Layer 0\\n`));
  assert.match(entry, /2 Notes moved state:/);
  assert.match(entry, /\| \[\[Equivalent fractions and cancellation\]\] \| 0 \| stub \| drafted \|/);
  assert.match(entry, /\| \[\[Signed arithmetic and order of operations\]\] \| 0 \| stub \| drafted, reviewed by agent \|/);
  assert.match(entry, /6 concept Notes: 4 stub, 2 drafted, 0 reviewed/);
  assert.match(entry, /check fails/);
  const levels = unescape(entry).split("\n").filter((line) => line.startsWith("- "));
  assert.deepEqual(levels, report.metrics.map((metric) => `- ${metric.title}: ${metric.level}`));

  // Nothing moved since, so a further run records nothing.
  const before = await read(vault, LOG);
  await generate(vault);
  assert.equal(await read(vault, LOG), before);
});

test("generate --layer records the Layer it dispatched", async () => {
  const { vault } = await makeScaffoldedVault(GRAPH);
  // Every Pack carries the notation authority whole, so a Layer cannot be dispatched without one.
  await writeFile(
    join(vault, "Conventions.md"),
    "---\nkind: reference\ndomain: wiki\nrequires: []\nstatus: drafted\nreviewed_by: none\ncreated: 2026-10-01\nupdated: 2026-10-01\n---\n\n## In one sentence\n\nThe fixture's notation.\n",
    "utf8",
  );
  await generate(vault);

  const { exitCode, stdout, stderr } = await generate(vault, "--layer", "1");
  const log = (await read(vault, LOG)).replace(/\r\n/g, "\n");

  assert.equal(exitCode, 0, stdout + stderr);
  const entry = entries(log).at(-1);
  assert.match(entry, new RegExp(`^## ${today()} · Layer 1\\n`));
  assert.match(entry, /Context Packs written for Layer 1: 2 Nodes\./);
  assert.match(entry, /No Note moved state\./);
});
