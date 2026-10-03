// `index.md`: the entry point to the Wiki, written by `generate` and never by hand.
//
// It lists every concept Note in the order the Module can be learned — computed Layer by
// Layer, the Floor first and the Terminal Node last — with each Note's status and one-sentence
// summary, then the Notes that are not concepts. Its counts are the report's. It has no
// frontmatter, so it is not a Note and no graph computation reads it.

import { counted, escapeText } from "./markdown-text.js";
import { CONCEPT, summaryOf, valueOf } from "./notes.js";

export const INDEX_PATH = "index.md";

/** What each kind of Note other than a concept is listed as, in this order. */
const OTHER_KINDS = [
  ["reference", "Reference"],
  ["source", "Sources"],
  ["observability", "Observability"],
];

/**
 * @param {object} index
 * @param {object} index.report what `assessHealth` returned
 * @param {Awaited<ReturnType<typeof import("./notes.js").loadNotes>>} index.notes every Note
 * @param {Map<string, number | undefined>} index.layers each concept Note's Layer, by path
 * @param {string[]} index.extras structural files to list beside the Notes, as vault paths
 */
export function renderIndex({ report, notes, layers, extras }) {
  const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const link = (path) => `[[${path.split("/").at(-1).replace(/\.md$/, "")}]]`;
  const sections = [
    `# Calculus Wiki

The entry point to the Wiki: every concept Note in the Module, in the order it can be learned — Floor first, the Terminal Node last. Written by \`npm run generate\`; never edit it by hand.`,
  ];

  const progress =
    report.status === "error"
      ? `\`check\` cannot run, so there are no counts: ${escapeText(report.error)}`
      : `${counted(report.progress.conceptNotes, "concept Note")}: ${report.progress.status.stub} stub, ${report.progress.status.drafted} drafted, ${report.progress.status.reviewed} reviewed. The health of the Wiki is on the [[Graph Health Dashboard]], and what the pipeline did is in the [[log]].`;
  sections.push("## Progress", progress);

  const concepts = notes.filter((note) => valueOf(note, "kind") === CONCEPT);
  const grouped = new Map();
  for (const note of concepts) {
    const layer = layers.get(note.path);
    grouped.set(layer, [...(grouped.get(layer) ?? []), note]);
  }
  const ordered = [...grouped.keys()].sort((a, b) => (a ?? Infinity) - (b ?? Infinity));
  sections.push(
    "## Learning sequence",
    ...ordered.map((layer) => {
      const heading = layer === undefined ? "### Without a Layer" : `### Layer ${layer}${layer === 0 ? " — the Floor" : ""}`;
      const items = grouped.get(layer).sort(byName).map((note) => {
        const summary = summaryOf(note);
        return `- [[${note.name}]]${summary ? ` — ${summary}` : ""} *${valueOf(note, "status") ?? "no status"}*`;
      });
      return `${heading}\n\n${items.join("\n")}`;
    }),
  );

  const others = OTHER_KINDS.flatMap(([kind, heading]) => {
    const found = notes.filter((note) => valueOf(note, "kind") === kind).sort(byName);
    return found.length === 0 ? [] : [`### ${heading}\n\n${found.map((note) => `- ${link(note.path)}`).join("\n")}`];
  });
  if (extras.length > 0) others.push(`### Structural\n\n${extras.map((path) => `- ${link(path)}`).join("\n")}`);
  sections.push("## Beyond the concepts", ...others);

  return `${sections.join("\n\n")}\n`;
}
