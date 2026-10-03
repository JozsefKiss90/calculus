// The slice of the notation authority a Context Pack carries (ticket 19).
//
// `wiki/Conventions.md` grows with every curated source, so a Pack no longer carries it whole.
// It carries everything above `## Entries` — the instructions for using the file — and the
// entries the Node can be expected to write with, chosen by the closure rule the author set on
// 2026-10-03:
//
//   - a general entry, one every Note writing arithmetic needs, is always in;
//   - any other entry is in when its term, or a LaTeX command its **This Wiki** line uses,
//     appears in the Node's name or in the text of a Note in its Prerequisite Closure.
//
// The rule is the Pack's own logic applied to notation: an author sees what its prerequisites
// established. Entries left out are named in the Pack, so an author who needs one can ask.

const ENTRIES_HEADING = "## Entries";

/** Terms every Pack carries whatever the Node, because every Note writes arithmetic. */
export const GENERAL_ENTRIES = ["Order of operations", "Brackets", "Multiplication sign", "Decimal point and digit groups", "Index and power"];

/**
 * LaTeX commands too common to say anything about which entry a Note needs. A command outside
 * this list — `\div`, `\infty`, `\tan`, `\lim` — is a fingerprint of one convention.
 */
const COMMON_COMMANDS = new Set(["frac", "dfrac", "tfrac", "left", "right", "text", "mathrm", "quad", "qquad", "ldots", "dots", "cdots", "\\", ",", ";", "!"]);

/**
 * @param {string} conventions the notation authority, whole
 * @param {{name: string, closureTexts: string[]}} node the Node's name, and the text of each
 *   Note in its Prerequisite Closure (frontmatter and all; nothing from it is copied)
 * @returns {{text: string, included: string[], omitted: string[], total: number}}
 *   `text` is the slice, verbatim segments of the file; the terms are in file order
 */
export function sliceConventions(conventions, { name, closureTexts }) {
  const { preamble, entries } = parseConventions(conventions);
  const corpus = [name, ...closureTexts.map(stripFrontmatter)].join("\n").toLowerCase();

  const included = [];
  const omitted = [];
  for (const entry of entries) {
    (isGeneral(entry) || mentions(corpus, entry) ? included : omitted).push(entry);
  }

  const chunks = included.map((entry) => entry.text.replace(/\n*$/, "\n"));
  const text = `${preamble.replace(/\n*$/, "\n")}${chunks.length === 0 ? "" : `\n${chunks.join("\n")}`}`;
  return { text, included: included.map(({ term }) => term), omitted: omitted.map(({ term }) => term), total: entries.length };
}

/** The file as its preamble up to and including the Entries heading, and one chunk per `###` entry. */
function parseConventions(conventions) {
  const text = conventions.replace(/\r\n/g, "\n");
  const headingAt = text.indexOf(`\n${ENTRIES_HEADING}\n`);
  if (headingAt === -1) return { preamble: text, entries: [] };
  const split = headingAt + ENTRIES_HEADING.length + 2;
  const preamble = text.slice(0, split);
  const entries = text
    .slice(split)
    .split(/^(?=### )/m)
    .filter((chunk) => chunk.startsWith("### "))
    .map((chunk) => ({
      term: /^### (.+)$/m.exec(chunk)[1].trim(),
      thisWiki: /^- \*\*This Wiki:\*\* (.+)$/m.exec(chunk)?.[1] ?? "",
      text: chunk,
    }));
  return { preamble, entries };
}

const isGeneral = ({ term }) => GENERAL_ENTRIES.some((general) => general.toLowerCase() === term.toLowerCase());

/** Whether the corpus names the entry: one of its term's phrases, or a telling LaTeX command. */
function mentions(corpus, { term, thisWiki }) {
  for (const phrase of phrasesOf(term)) {
    if (new RegExp(`(?<![a-z])${escapeRegExp(phrase)}(?:s|es)?(?![a-z])`, "i").test(corpus)) return true;
  }
  for (const command of commandsOf(thisWiki)) {
    if (new RegExp(`\\\\${command}(?![a-zA-Z])`).test(corpus)) return true;
  }
  return false;
}

/**
 * The phrases a term is made of: the term itself, and each part when it joins several with
 * commas or "and" — *Decimal point and digit groups* is met by "decimal point" alone. A plural
 * ending is dropped so that *Intervals* is met by "interval".
 */
function phrasesOf(term) {
  const parts = [term, ...term.split(/,\s*(?:and\s+)?|\s+and\s+/)];
  return [...new Set(parts.map((part) => part.trim().toLowerCase()).filter(Boolean))].map(singular);
}

const singular = (phrase) => phrase.replace(/(?<=[a-z]{3})(?:ies|es|s)$/, (ending) => (ending === "ies" ? "y" : ""));

function commandsOf(thisWiki) {
  return [...new Set([...thisWiki.matchAll(/\\([a-zA-Z]+)/g)].map(([, command]) => command))].filter((command) => !COMMON_COMMANDS.has(command));
}

const stripFrontmatter = (text) => text.replace(/\r\n/g, "\n").replace(/^---\n[\s\S]*?\n---\n/, "");

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
