// Ticket 07: wiki/Conventions.md is the notation authority every Note defers to. `check`
// holds its frontmatter and its mathematics like any Note's (check-real-vault.test.js);
// this holds what is particular to it — entries of one fixed shape, the order-of-operations
// conflict recorded with both namings attributed, and a length that fits a Context Pack whole.
//
// Since 14 it also holds the file to the source Notes in wiki/sources/. A source Note lists, under
// `## Notation it uses`, the entry for each convention its reference uses, and each of those
// entries carries a line attributed to that source: **Same** where it agrees with this Wiki,
// **Elsewhere** where it does not. One line attributes one source, so two sources that disagree
// are two lines, never one merged entry.
//
// Like check-real-vault.test.js, it reads the real vault, because the files are the thing
// under test.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CONVENTIONS = fileURLToPath(new URL("../wiki/Conventions.md", import.meta.url));
const SOURCES = fileURLToPath(new URL("../wiki/sources/", import.meta.url));

/**
 * Short enough to paste into a Context Pack whole, beside one Node's skeleton. Raised from 120
 * in 14, when the first curated source added its Same and Elsewhere lines: every later source
 * adds more, so this budget is where the growth shows.
 */
const MAX_LINES = 140;

const ENTRY_LINE = /^- \*\*(This Wiki|Same|Elsewhere):\*\* (.+)$/;

async function entries() {
  const lines = (await readFile(CONVENTIONS, "utf8")).split(/\r?\n/);
  const start = lines.indexOf("## Entries");
  assert.notEqual(start, -1, "Conventions.md has no ## Entries section");

  const found = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,2} /.test(line)) break;
    if (line.startsWith("### ")) found.push({ term: line.slice(4), lines: [] });
    else if (line.trim() !== "") {
      assert.ok(found.length > 0, `text before the first entry: ${line}`);
      found.at(-1).lines.push(line);
    }
  }
  return found;
}

/** Every source Note in the vault: its name, and the entries it says its reference uses. */
async function sourceNotes() {
  const notes = [];
  for (const file of (await readdir(SOURCES)).filter((name) => name.endsWith(".md"))) {
    const text = (await readFile(join(SOURCES, file), "utf8")).replace(/\r\n/g, "\n");
    if (!/^kind: source$/m.test(text)) continue;
    const section = /^## Notation it uses\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(text);
    assert.ok(section, `${file} has no ## Notation it uses section`);
    const uses = [...section[1].matchAll(/\[\[Conventions#([^\]|]+)(?:\|[^\]]*)?\]\]/g)].map((match) => match[1].trim());
    notes.push({ name: file.replace(/\.md$/, ""), uses });
  }
  return notes;
}

/** The Note names the wikilinks in some text point at. */
const linksIn = (text) => [...text.matchAll(/\[\[([^\]|#]*)[^\]]*\]\]/g)].map((match) => match[1].trim());

/** Each entry line as [term, line, the source Notes its attribution names]. */
async function attributions() {
  const sources = new Set((await sourceNotes()).map(({ name }) => name));
  return (await entries()).flatMap(({ term, lines }) =>
    lines.map((line) => {
      const attribution = line.split(" — ").slice(1).join(" — ");
      return [term, line, linksIn(attribution).filter((name) => sources.has(name))];
    }),
  );
}

test("Conventions.md is short enough to go into a Context Pack whole", async () => {
  const lines = (await readFile(CONVENTIONS, "utf8")).trimEnd().split(/\r?\n/);
  assert.ok(lines.length <= MAX_LINES, `${lines.length} lines, over the ${MAX_LINES}-line budget`);
});

test("every convention entry has the fixed shape: the term, this Wiki's choice, each conflict attributed", async () => {
  const found = await entries();
  assert.ok(found.length > 0, "no entries");

  for (const { term, lines } of found) {
    const fields = lines.map((line) => {
      const match = ENTRY_LINE.exec(line);
      assert.ok(match, `${term}: "${line}" is not a This Wiki, Same or Elsewhere line`);
      return { field: match[1], text: match[2] };
    });
    assert.equal(fields[0]?.field, "This Wiki", `${term}: the first line is not This Wiki's choice`);
    assert.equal(fields.filter((f) => f.field === "This Wiki").length, 1, `${term}: more than one This Wiki line`);

    const elsewhere = fields.filter((f) => f.field === "Elsewhere");
    assert.ok(elsewhere.length > 0, `${term}: no Elsewhere line, not even "none known"`);
    for (const { text } of elsewhere) {
      if (text === "none known.") continue;
      // The attribution follows a dash: what the other convention is — who uses it.
      assert.match(text, / — \S/, `${term}: "${text}" names no one who uses it`);
    }
    // A Same line is there only to say which source agrees, so it always ends by naming one.
    for (const { text } of fields.filter((f) => f.field === "Same")) {
      assert.match(text, / — \[\[[^\]]+\]\]\.?$/, `${term}: "${text}" does not end with the source Note that agrees`);
    }
  }
});

test("the order-of-operations entry records BIDMAS against PEMDAS, both attributed", async () => {
  const entry = (await entries()).find(({ term }) => /order of operations/i.test(term));
  assert.ok(entry, "no order-of-operations entry");

  const [choice, ...elsewhere] = entry.lines;
  assert.match(choice, /BIDMAS.*UK/, "BIDMAS is not attributed to who teaches it");
  assert.ok(
    elsewhere.some((line) => /PEMDAS/.test(line) && / — .*US/.test(line)),
    "PEMDAS is not recorded as another source's naming, with who uses it",
  );
});

test("at least one reference is curated, and its source Note lists the conventions it uses", async () => {
  const notes = await sourceNotes();
  assert.ok(notes.length > 0, "no source Note in wiki/sources/");
  for (const { name, uses } of notes) assert.ok(uses.length > 0, `${name} lists no convention it uses`);
});

test("every convention a source Note says its reference uses has an entry with a line attributed to it", async () => {
  const terms = new Set((await entries()).map(({ term }) => term));
  const attributed = await attributions();

  for (const { name, uses } of await sourceNotes()) {
    for (const term of uses) {
      assert.ok(terms.has(term), `${name} uses [[Conventions#${term}]], and Conventions.md has no such entry`);
      assert.ok(
        attributed.some(([entry, , named]) => entry === term && named.includes(name)),
        `${term}: no line is attributed to [[${name}]], which uses it`,
      );
    }
  }
});

test("every line attributed to a source Note sits under an entry that source says it uses", async () => {
  const uses = new Map((await sourceNotes()).map(({ name, uses }) => [name, new Set(uses)]));
  for (const [term, line, named] of await attributions()) {
    for (const name of named) {
      assert.ok(uses.get(name).has(term), `${term}: "${line}" cites [[${name}]], whose ## Notation it uses does not list it`);
    }
  }
});

test("one line attributes one source, so two sources are two lines and never one merged entry", async () => {
  for (const [term, line, named] of await attributions()) {
    assert.ok(named.length <= 1, `${term}: "${line}" attributes ${named.join(" and ")} together; give each its own line`);
  }
});
