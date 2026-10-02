// Ticket 07: wiki/Conventions.md is the notation authority every Note defers to. `check`
// holds its frontmatter and its mathematics like any Note's (check-real-vault.test.js);
// this holds what is particular to it — entries of one fixed shape, the order-of-operations
// conflict recorded with both namings attributed, and a length that fits a Context Pack whole.
//
// Like check-real-vault.test.js, it reads the real vault, because the file is the thing
// under test.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const CONVENTIONS = fileURLToPath(new URL("../wiki/Conventions.md", import.meta.url));

/** Short enough to paste into a Context Pack whole, beside one Node's skeleton. */
const MAX_LINES = 120;

const ENTRY_LINE = /^- \*\*(This Wiki|Elsewhere):\*\* (.+)$/;

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
      assert.ok(match, `${term}: "${line}" is neither a This Wiki nor an Elsewhere line`);
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
