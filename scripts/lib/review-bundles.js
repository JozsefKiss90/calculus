// Review Bundles: what a Correctness Reviewer reads to review one Note.
//
// The Note Author sees one Pack and nothing else, so it cannot notice a problem outside its
// own Node (ADR-0005). The Bundle is the other side of that trade: it gives a reviewer who did
// not write the prose what the author could not see. It carries exactly these sections, in
// this order:
//
//   Note                 the Note under review, whole, with its path and computed Layer
//   Prerequisites        each direct prerequisite's Note, whole: what the Note may build on
//   Further below        every deeper Node in its Prerequisite Closure, by name and summary
//   Not taught before it every other Node of the Module, by name: ideas the Note may not use.
//                        A Floor Note's lists only Nodes above the Floor, because the other
//                        Floor Nodes are, like it, knowledge the Module assumes
//   Layer siblings       every other Note in the same Layer, whole: written in parallel, by
//                        authors blind to each other
//   Notation authority   the vault's Conventions.md, whole
//   Sources              the source Notes a claim may trace to, whole — or which of the two
//                        reasons there are none
//
// A Note not yet written is named as such rather than pasted: a stub's skeleton teaches
// nothing, and a reviewer must not read its empty sections as "teaches nothing relevant".
//
// Bundles are written beside the vault, in `.review-bundles/<Note name>.md`, never inside it.
// Each run replaces only the one Bundle it writes, so Notes can be reviewed in parallel.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, posix, resolve } from "node:path";
import { layersOf } from "./graph.js";
import { fence, NOTATION_AUTHORITY } from "./context-packs.js";
import { buildNotesGraph, indexByName, isConcept, summaryOf, valueOf } from "./notes.js";

const BUNDLE_DIRECTORY = ".review-bundles";

export class BundleError extends Error {}

/**
 * Write the Review Bundle for one written concept Note.
 *
 * @param {string} vaultDir
 * @param {Awaited<ReturnType<typeof import("./notes.js").loadNotes>>} notes
 * @param {string} name the Note's name, matched as a wikilink is: ignoring case
 * @returns {Promise<{written: string}>} relative to the directory holding the vault
 * @throws {BundleError} when there is no such concept Note, it is still a stub, or the
 *   notation authority is missing; nothing is written then
 * @throws {import("./graph.js").GraphError} when the Notes do not form a graph
 */
export async function writeReviewBundle(vaultDir, notes, name) {
  const graph = buildNotesGraph(notes);
  const concepts = notes.filter(isConcept);
  const [note, ...others] = indexByName(concepts).get(name.toLowerCase()) ?? [];
  if (!note) throw new BundleError(`there is no concept Note named "${name}"`);
  if (others.length > 0) throw new BundleError(`more than one concept Note is named "${name}"`);
  if (valueOf(note, "status") === "stub") {
    throw new BundleError(`${note.path} is still a stub: there is nothing to review until it is drafted`);
  }

  const vaultName = basename(resolve(vaultDir));
  const text = async (each) => readFile(join(vaultDir, each.path), "utf8");
  const byPath = new Map(notes.map((each) => [each.path, each]));
  const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const layers = layersOf(graph);
  const layer = layers.get(note.path);
  const prerequisites = graph.prerequisitesOf(note.path).map((id) => byPath.get(id));
  const below = closureBelow(graph, note.path).map((id) => byPath.get(id));
  const closure = new Set([note, ...prerequisites, ...below]);

  let notation;
  try {
    notation = await text({ path: NOTATION_AUTHORITY });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    throw new BundleError(`${vaultName}/${NOTATION_AUTHORITY}, the notation authority, does not exist, and every Bundle carries it whole`);
  }

  const bundle = render({
    vaultName,
    note,
    noteText: await text(note),
    layer,
    prerequisites: await Promise.all(prerequisites.map(async (each) => ({ note: each, text: await text(each) }))),
    below: below.sort(byName),
    notBefore: concepts
      .filter((each) => !closure.has(each) && !(prerequisites.length === 0 && graph.prerequisitesOf(each.path).length === 0))
      .sort(byName),
    siblings: await Promise.all(
      concepts
        .filter((each) => each !== note && layers.get(each.path) === layer)
        .sort(byName)
        .map(async (each) => ({ note: each, text: await text(each) })),
    ),
    notation,
    sources: await Promise.all(
      notes.filter((each) => valueOf(each, "kind") === "source").map(async (each) => ({ note: each, text: await text(each) })),
    ),
  });

  const file = `${note.name}.md`;
  await mkdir(join(vaultDir, "..", BUNDLE_DIRECTORY), { recursive: true });
  await writeFile(join(vaultDir, "..", BUNDLE_DIRECTORY, file), bundle, "utf8");
  return { written: posix.join(BUNDLE_DIRECTORY, file) };
}

/** Every Node the Note's prerequisites require in turn, down to the Floor, by id. */
function closureBelow(graph, id) {
  const direct = new Set(graph.prerequisitesOf(id));
  const seen = new Set();
  const visit = (each) => {
    for (const next of graph.prerequisitesOf(each)) {
      if (seen.has(next)) continue;
      seen.add(next);
      visit(next);
    }
  };
  for (const each of direct) visit(each);
  return [...seen].filter((each) => !direct.has(each));
}

function render({ vaultName, note, noteText, layer, prerequisites, below, notBefore, siblings, notation, sources }) {
  const domain = valueOf(note, "domain");
  const floor = prerequisites.length === 0;
  const written = (each) => valueOf(each.note, "status") !== "stub";
  // Written Notes whole under their introduction, then the stubs by name.
  const notesSection = (intro, list) => {
    const stubs = list.filter((each) => !written(each));
    return [
      ...(stubs.length === list.length ? [] : [intro]),
      ...list.filter(written).flatMap((each) => [`\`${vaultName}/${each.note.path}\`:`, fence(each.text)]),
      ...(stubs.length === 0 ? [] : [`Not yet written: ${stubs.map((each) => `**${each.note.name}**`).join(", ")}.`]),
    ];
  };

  return [
    `# Review Bundle: ${note.name}`,
    "## Note",
    `\`${vaultName}/${note.path}\`, a ${domain} Note in Layer ${layer}, as it stands:`,
    fence(noteText),
    "## Prerequisites",
    ...(floor
      ? ["None: this is a Floor Node. It assumes only the Module's Floor, 8th-grade mathematics, and teaches the rest itself."]
      : notesSection("Each Note this one requires, whole. What they teach, the Note may use without teaching it again.", prerequisites)),
    "## Further below",
    below.length === 0
      ? "Nothing: no prerequisite builds on another Node."
      : [
          "Every Node those prerequisites build on in turn, down to the Floor. Each is taught before this Note, so the Note may use it too.",
          "",
          below.map((each) => `- **${each.name}** — ${summaryOf(each) || "*no one-sentence summary written yet*"}`).join("\n"),
        ].join("\n"),
    "## Not taught before it",
    notBefore.length === 0
      ? "Nothing: every Node of the Module is this Note or below it."
      : [
          floor
            ? "Every Node of the Module above the Floor. None is taught before this Note, so the Note may not use the idea any of them teaches, except to point to it as a marked Cross-reference. " +
              "The other Floor Nodes are not listed: like this one, each is 8th-grade knowledge the Module assumes, so this Note may use their ideas."
            : "Every other Node of the Module. None is taught before this Note, so the Note may not use the idea any of them teaches, except to point to it as a marked Cross-reference.",
          "",
          notBefore.map((each) => `- ${each.name}`).join("\n"),
        ].join("\n"),
    "## Layer siblings",
    ...(siblings.length === 0
      ? [`No other Note is in Layer ${layer}.`]
      : notesSection(
          `The other Notes in Layer ${layer}, written alongside this one by authors who could not see each other. Each written one, whole:`,
          siblings,
        )),
    "## Notation authority",
    `\`${vaultName}/${NOTATION_AUTHORITY}\`, whole:`,
    fence(notation),
    "## Sources",
    ...sourcesSection({ floor, domain, vaultName, sources }),
  ].join("\n\n") + "\n";
}

/**
 * The same two empty cases a Context Pack names, so the reviewer holds the Note to the rule
 * its author was given: no sources apply on the Floor, and none may exist yet for a domain.
 */
function sourcesSection({ floor, domain, vaultName, sources }) {
  if (floor) {
    return ["No sources apply. This is a Floor Node: its claims are 8th-grade knowledge the Module assumes, and need no citation."];
  }
  const tagged = sources.filter(({ note }) => [valueOf(note, "tags") ?? []].flat().includes(domain));
  if (tagged.length === 0) {
    return [`No source Note exists yet for the ${domain} domain, so a claim in this Note that needs a source has none to trace to.`];
  }
  return [`The source Notes for the ${domain} domain, whole:`, ...tagged.flatMap(({ note, text }) => [`\`${vaultName}/${note.path}\`:`, fence(text)])];
}
