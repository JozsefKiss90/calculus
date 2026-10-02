// Ticket 07: `check` holds every Note's mathematics to invariant 8 — every `$…$` and
// `$$…$$` parses under KaTeX, the dialect Obsidian's MathJax and the App's KaTeX share
// (ADR-0006). Every fixture starts as a vault `scaffold` has just filled, and each puts
// mathematics into a Note's prose the way an author would.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { checkVault as check, invariant, makeScaffoldedVault } from "./helpers/vault.js";

const GRAPH = `flowchart TD
    D["Derivative"] --> L["Limits"]

    subgraph LIM["Limits"]
        L --> C["Continuity"]
    end`;

const LIMITS = "limits/Limits.md";
const CONTINUITY = "limits/Continuity.md";
const ANCHOR = "Module 1 Anchor Graph.md";

const scaffoldedVault = () => makeScaffoldedVault(GRAPH);

/** Write prose under a Note's `## The idea`, the way an author fills a section. */
async function writeIdea(vault, path, prose) {
  const file = join(vault, path);
  const note = await readFile(file, "utf8");
  assert.ok(note.includes("## The idea\n"), `${path} has no ## The idea`);
  // A replacer function, because a replacement string reads `$$` as one dollar sign.
  await writeFile(file, note.replace("## The idea\n", () => `## The idea\n\n${prose}\n`), "utf8");
}

/** The 1-based line of the first line of the file containing the given text. */
async function lineOf(vault, path, text) {
  const lines = (await readFile(join(vault, path), "utf8")).split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(text));
  assert.notEqual(index, -1, `${text} is not in ${path}`);
  return index + 1;
}

/** Invariant 8's failures, without their prose. */
const failures = (report) =>
  invariant(report, 8).failures.map(({ problem, note, line, display, expression }) => ({ problem, note, line, display, expression }));

test("a MathJax-only macro fails check, and the report names the Note, the line and the expression", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(fixture.vault, LIMITS, String.raw`A boxed answer such as $\bbox[red]{x}$ renders in Obsidian and nowhere else.`);

  const { exitCode, stdout, report } = await check(fixture);

  assert.equal(exitCode, 1);
  assert.equal(report.status, "fail");
  assert.deepEqual(failures(report), [
    {
      problem: "katex-rejects",
      note: LIMITS,
      line: await lineOf(fixture.vault, LIMITS, "A boxed answer"),
      display: false,
      expression: String.raw`\bbox[red]{x}`,
    },
  ]);
  assert.match(invariant(report, 8).failures[0].message, /Undefined control sequence: \\bbox/);
  assert.match(stdout, /FAIL\s+8\s+Every \$…\$ and \$\$…\$\$ block parses under KaTeX/);
  assert.match(stdout, /limits\/Limits\.md:\d+: KaTeX rejects the inline expression \$\\bbox\[red\]\{x\}\$/);
});

test("display mathematics is validated too, across lines, and named by the line it opens on", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(
    fixture.vault,
    CONTINUITY,
    String.raw`Cancel the common factor:

$$
\require{cancel}
\frac{\cancel{(x - 1)}(x + 1)}{\cancel{x - 1}}
$$`,
  );

  const { exitCode, report } = await check(fixture);

  assert.equal(exitCode, 1);
  assert.deepEqual(failures(report), [
    {
      problem: "katex-rejects",
      note: CONTINUITY,
      line: (await lineOf(fixture.vault, CONTINUITY, String.raw`\require`)) - 1,
      display: true,
      expression: String.raw`\require{cancel}
\frac{\cancel{(x - 1)}(x + 1)}{\cancel{x - 1}}`,
    },
  ]);
});

test("valid KaTeX, inline and display, passes", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(
    fixture.vault,
    CONTINUITY,
    String.raw`A function is continuous at $a$ when $\lim_{x \to a} f(x) = f(a)$, as for $\sqrt{x}$ at $a > 0$.

$$\lim_{h \to 0} \frac{\sin h}{h} = 1$$

$$
\begin{aligned}
f(x) &= x^2 - 1 \\
     &= (x - 1)(x + 1)
\end{aligned}
$$`,
  );

  const { exitCode, stdout, report } = await check(fixture);

  assert.equal(exitCode, 0, stdout);
  assert.equal(invariant(report, 8).status, "pass");
});

test("a dollar sign in a fenced code block or a code span is not mathematics", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(
    fixture.vault,
    LIMITS,
    [
      "```",
      String.raw`$\bbox[red]{x}$ and $$\require{cancel}$$ are what this looks like in a source file.`,
      "```",
      "",
      "~~~latex",
      String.raw`$$\style{color:red}{x}$$`,
      "~~~",
      "",
      "Inline, `" + String.raw`$\class{a}{x}$` + "` is code, not mathematics.",
      "",
      String.raw`%% An Obsidian comment: $\bbox{x}$ never renders. %% <!-- Nor does $\require{x}$. -->`,
    ].join("\n"),
  );

  const { exitCode, stdout, report } = await check(fixture);

  assert.equal(exitCode, 0, stdout);
  assert.equal(invariant(report, 8).status, "pass");
});

test("a comment marker inside a code span, or an escaped backtick, hides no mathematics", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(
    fixture.vault,
    LIMITS,
    [
      "Write `<!--` to open a comment, then $\\bbox{a}$ is still mathematics -->.",
      "",
      "An escaped \\` is a backtick, so $\\style{color:red}{b}$ is mathematics too `.",
    ].join("\n"),
  );

  const { exitCode, report } = await check(fixture);

  assert.equal(exitCode, 1);
  assert.deepEqual(
    failures(report).map(({ expression }) => expression),
    [String.raw`\bbox{a}`, String.raw`\style{color:red}{b}`],
  );
});

test("prose dollar signs are not mathematics: prices, and an escaped dollar", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(
    fixture.vault,
    LIMITS,
    String.raw`A book costs $5 and a pen costs $2. Write \$\bbox{x}\$ to show a dollar sign.`,
  );

  const { exitCode, stdout } = await check(fixture);

  assert.equal(exitCode, 0, stdout);
});

test("a display block that is never closed is named, rather than silently rendered as dollar signs", async () => {
  const fixture = await scaffoldedVault();
  await writeIdea(fixture.vault, LIMITS, "$$\n\\frac{1}{2}\n\nThe rest of the Note.");

  const { exitCode, report } = await check(fixture);

  assert.equal(exitCode, 1);
  assert.deepEqual(
    failures(report).map(({ problem, note, line }) => ({ problem, note, line })),
    [{ problem: "unclosed-display-maths", note: LIMITS, line: await lineOf(fixture.vault, LIMITS, "$$") }],
  );
});

test("every Note's mathematics is checked, not only concept Notes', and each bad expression is its own failure", async () => {
  const fixture = await scaffoldedVault();
  await writeFile(
    join(fixture.vault, ANCHOR),
    (await readFile(join(fixture.vault, ANCHOR), "utf8")) + String.raw`
Edges are counted as $|E| = \cssId{edges}{2}$.
`,
    "utf8",
  );
  await writeIdea(fixture.vault, LIMITS, String.raw`First $\bbox{a}$, then $b$, then $\style{color:red}{c}$.`);

  const { exitCode, report } = await check(fixture);

  assert.equal(exitCode, 1);
  assert.deepEqual(
    failures(report).map(({ note, expression }) => [note, expression]),
    [
      [ANCHOR, String.raw`|E| = \cssId{edges}{2}`],
      [LIMITS, String.raw`\bbox{a}`],
      [LIMITS, String.raw`\style{color:red}{c}`],
    ],
  );
});
