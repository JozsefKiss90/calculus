// The graded metrics: the spec's green / yellow / red thresholds table, each row with the
// action mandated at each level. A red metric fails `check` exactly as a broken invariant
// does; a yellow one passes and is shown. Five are computed. The sixth, Floor plausibility,
// is a recorded review judgement: this only lists the Floor Notes, matches them to the
// verdicts a human wrote down (floor-judgements.js) and counts the flagged ones.
//
// Three of the five are percentages, and they divide over the written concept Notes — those
// at `drafted` or `reviewed`. A stub has no prose to link from or put an Interactive in, so
// counting stubs would hold an unwritten Module red; the stub metric is what counts stubs.
//
// Cross-references are counted, never Edges. The reference wiki's floor of three inbound and
// three outbound links cannot hold in a prerequisite DAG — a Floor Node has no prerequisites
// and the Terminal Node has no dependents, by definition — so a link between two Notes
// joined by an Edge, in either direction, is never a Cross-reference, and a generated block
// (which only ever lists Edges) is never read for one.

import { GraphError, layersOf } from "./graph.js";
import { fencedBlocks, languageOf } from "./fences.js";
import { BLOCKS, endMarker, startMarker } from "./generated-blocks.js";
import { FLOOR_JUDGEMENTS_PATH } from "./floor-judgements.js";
import { buildNotesGraph, indexByName, isConcept, linkTarget, valueOf } from "./notes.js";

const WRITTEN = new Set(["drafted", "reviewed"]);
const STALE_AFTER_DAYS = 30;

/**
 * Each metric's thresholds: `yellowFrom` is the lowest value that is yellow and `redAbove`
 * the highest that is not red, in the metric's unit — a count, or a percentage.
 */
const METRIC = {
  brokenWikilinks: {
    id: "broken-wikilinks",
    title: "Broken wikilinks",
    unit: "count",
    yellowFrom: 1,
    redAbove: 3,
    bands: { green: "0", yellow: "1–3", red: "4+" },
    actions: {
      green: "None.",
      yellow: "Fix each listed link in the next commit that touches its Note: point it at the Note's current name, or remove it.",
      red: "The build is blocked. Fix or remove each listed link before anything else lands.",
    },
  },
  zeroCrossReferences: {
    id: "zero-cross-references",
    title: "Notes with zero Cross-references",
    unit: "percent",
    yellowFrom: 10,
    redAbove: 25,
    bands: { green: "<10%", yellow: "10–25%", red: ">25%" },
    actions: {
      green: "None.",
      yellow: "When a listed Note is next edited, link it to a Note it contrasts with or where its idea reappears. A link to a prerequisite or a dependent is an Edge and does not count.",
      red: "The build is blocked. Add a Cross-reference to the listed Notes until no more than 25% of written Notes have none.",
    },
  },
  staleUpdated: {
    id: "stale-updated",
    title: `Stale updated (>${STALE_AFTER_DAYS}d, non-reviewed)`,
    unit: "percent",
    yellowFrom: 10,
    redAbove: 20,
    bands: { green: "<10%", yellow: "10–20%", red: ">20%" },
    actions: {
      green: "None.",
      yellow: "Send the listed drafted Notes to Correctness Review, oldest first. Never refresh updated without a substantive edit.",
      red: "The build is blocked. Review or revise the listed drafted Notes, oldest first, until no more than 20% are stale. Never refresh updated without a substantive edit.",
    },
  },
  stubsInOpenedLayers: {
    id: "stubs-in-opened-layers",
    title: "Notes still stub after their Layer is opened",
    unit: "count",
    yellowFrom: 1,
    redAbove: 3,
    bands: { green: "0", yellow: "1–3", red: "4+" },
    actions: {
      green: "None.",
      yellow: "Draft the listed stubs before any Note in a higher Layer is written.",
      red: "The build is blocked. Draft the listed stubs, or hold the Layer's drafts back and land the Layer together.",
    },
  },
  floorPlausibility: {
    id: "floor-plausibility",
    title: "Floor plausibility: Floor Notes flagged above 8th grade",
    unit: "count",
    yellowFrom: 1,
    redAbove: 1,
    bands: { green: "0", yellow: "1", red: "2+" },
    actions: {
      green: "None.",
      yellow: "Expand the flagged Floor Note: propose the prerequisites it needs as a change to the Anchor Graph, for the author to make. Re-judge it only if the flag was wrong.",
      red: "The build is blocked. Expand the flagged Floor Notes in the Anchor Graph, or re-judge a flag that was wrong, until no more than one is flagged.",
    },
  },
  archetypeCoverage: {
    id: "archetype-coverage",
    title: "Archetype coverage: Notes with no Interactive",
    unit: "percent",
    yellowFrom: 20,
    redAbove: 40,
    bands: { green: "<20%", yellow: "20–40%", red: ">40%" },
    actions: {
      green: "None.",
      yellow: "Run the Interactive Author on the listed Notes, filing an Archetype gap where no Archetype fits.",
      red: "The build is blocked. Run the Interactive Author on the listed Notes until no more than 40% of written Notes have no Interactive.",
    },
  },
};

/**
 * @param {Awaited<ReturnType<typeof import("./notes.js").loadNotes>>} notes
 * @param {object} options
 * @param {string[]} options.files every file in the vault, as vault-relative paths
 * @param {string} options.today the date staleness is measured to, as YYYY-MM-DD
 * @param {import("./floor-judgements.js").Judgement[]} options.judgements the recorded Floor
 *   plausibility verdicts
 */
export function computeMetrics(notes, { files, today, judgements }) {
  const concepts = notes.filter(isConcept);
  const written = concepts.filter((note) => WRITTEN.has(valueOf(note, "status")));

  let graph;
  try {
    graph = buildNotesGraph(notes);
  } catch (error) {
    if (!(error instanceof GraphError)) throw error;
    graph = { unbuildable: error.message };
  }

  return [
    brokenWikilinks(notes, files),
    zeroCrossReferences(concepts, written, graph),
    staleUpdated(written, today),
    stubsInOpenedLayers(concepts, graph),
    archetypeCoverage(written),
    floorPlausibility(concepts, judgements),
  ];
}

function levelOf(metric, value, of) {
  // A percentage is compared as count × 100 against threshold × total, so 10% of 10 is
  // exactly yellow rather than a float's guess at it. Nothing written yet is 0%.
  if (metric.unit === "percent" && of === 0) return "green";
  const scaled = metric.unit === "percent" ? value * 100 : value;
  const scale = metric.unit === "percent" ? of : 1;
  if (scaled > metric.redAbove * scale) return "red";
  if (scaled >= metric.yellowFrom * scale) return "yellow";
  return "green";
}

function graded(metric, { count, of, notes, ...details }) {
  const { id, title, unit, bands, actions } = metric;
  const level = levelOf(metric, count, of);
  const measure =
    unit === "percent" ? { count, of, percent: of === 0 ? 0 : Math.round((count * 1000) / of) / 10 } : { count };
  return { id, title, unit, level, ...measure, bands, action: actions[level], actions, ...details, notes };
}

/** A metric the Notes' graph is needed for, when the Notes do not form one. Invariant 11 names why. */
function unmeasured(metric, graph) {
  const { id, title, unit, bands, actions } = metric;
  return {
    id,
    title,
    unit,
    level: "skipped",
    reason: `the Notes do not form a graph: ${graph.unbuildable}`,
    bands,
    actions,
    notes: [],
  };
}

const offender = (note, message, details = {}) => ({ note: note.path, ...details, message: `${note.path}: ${message}` });

// ---------------------------------------------------------------------------------------
// Reading links out of prose

/**
 * A Note's body as a reader sees links in it: fenced blocks, inline code and HTML comments
 * removed, since a wikilink in any of them is text rather than a link. With `authoredOnly`,
 * the generated blocks go too.
 */
function linkableText(note, { authoredOnly = false } = {}) {
  let body = note.frontmatter.body;
  if (authoredOnly) {
    for (const name of BLOCKS) {
      body = body.replace(new RegExp(`${escaped(startMarker(name))}[\\s\\S]*?${escaped(endMarker(name))}`, "g"), "");
    }
  }
  const lines = body.split(/\r?\n/);
  for (const { open, close } of fencedBlocks(lines)) {
    for (let i = open; i <= (close === -1 ? lines.length - 1 : close); i += 1) lines[i] = "";
  }
  return lines
    .map((line) => line.replace(/(`+)[^`].*?\1/g, ""))
    .join("\n")
    .replace(/<!--[\s\S]*?-->/g, "");
}

const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Each wikilink in the text, with the name it points at. */
function wikilinkTargets(text) {
  return [...text.matchAll(/!?\[\[([^\]\n]*)\]\]/g)].map((match) => ({
    link: match[0],
    target: linkTarget(match[1]),
  }));
}

// ---------------------------------------------------------------------------------------
// The six metrics

/**
 * Every wikilink in every Note's body that names no file in the vault. A link resolves the
 * way Obsidian resolves it: to any Markdown file by name, ignoring case, or to an attachment
 * by its name with extension. `requires` is not read here; a broken prerequisite is
 * invariant 5's.
 */
function brokenWikilinks(notes, files) {
  const names = new Set();
  for (const file of files) {
    const base = file.split("/").at(-1).toLowerCase();
    names.add(base);
    if (base.endsWith(".md")) names.add(base.slice(0, -3));
  }

  const broken = [];
  for (const note of notes) {
    for (const { link, target } of wikilinkTargets(linkableText(note))) {
      // `[[#heading]]` points into the Note itself.
      if (target === "" || names.has(target.toLowerCase())) continue;
      broken.push(offender(note, `${link.startsWith("!") ? "!" : ""}[[${target}]] resolves to no Note`, { target }));
    }
  }
  return graded(METRIC.brokenWikilinks, { count: broken.length, notes: broken });
}

/**
 * Written Notes that are neither end of any Cross-reference: a link in authored prose
 * between two distinct concept Notes not joined by an Edge. A Cross-reference makes no
 * ordering claim and has no direction, so it counts for both Notes it joins.
 */
function zeroCrossReferences(concepts, written, graph) {
  if (graph.unbuildable) return unmeasured(METRIC.zeroCrossReferences, graph);

  const byName = indexByName(concepts);
  const joinedByEdge = new Set(graph.edges.flatMap(({ from, to }) => [`${from}\n${to}`, `${to}\n${from}`]));
  const pairs = new Set();
  const referenced = new Set();

  for (const note of concepts) {
    for (const { target } of wikilinkTargets(linkableText(note, { authoredOnly: true }))) {
      const found = byName.get(target.toLowerCase()) ?? [];
      if (found.length !== 1) continue;
      const [other] = found;
      if (other.path === note.path || joinedByEdge.has(`${note.path}\n${other.path}`)) continue;
      pairs.add([note.path, other.path].sort().join("\n"));
      referenced.add(note.path);
      referenced.add(other.path);
    }
  }

  const without = written.filter((note) => !referenced.has(note.path));
  return graded(METRIC.zeroCrossReferences, {
    count: without.length,
    of: written.length,
    crossReferences: pairs.size,
    edges: graph.edges.length,
    notes: without.map((note) => offender(note, "has no Cross-reference to or from another Note")),
  });
}

/** Written Notes not yet reviewed whose `updated` is more than 30 days before today. */
function staleUpdated(written, today) {
  const stale = [];
  for (const note of written) {
    if (valueOf(note, "status") === "reviewed") continue;
    const updated = valueOf(note, "updated");
    const days = daysBetween(updated, today);
    if (days === undefined) {
      stale.push(offender(note, `updated is "${updated}", which is not a YYYY-MM-DD date, so it cannot be shown fresh`, { updated }));
    } else if (days > STALE_AFTER_DAYS) {
      stale.push(offender(note, `is drafted and was last updated ${days} days ago, on ${updated}`, { updated, days }));
    }
  }
  return graded(METRIC.staleUpdated, { count: stale.length, of: written.length, notes: stale });
}

function daysBetween(from, to) {
  const utc = (date) => {
    const match = typeof date === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null;
    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined;
  };
  const [start, end] = [utc(from), utc(to)];
  return start === undefined || end === undefined ? undefined : Math.round((end - start) / 86_400_000);
}

/**
 * Stubs in a Layer that is open. A Layer is computed, as the longest path from a Node to the
 * Floor, and it opens when any concept Note in it is written: work on it has begun, and a
 * Layer is meant to land whole.
 */
function stubsInOpenedLayers(concepts, graph) {
  if (graph.unbuildable) return unmeasured(METRIC.stubsInOpenedLayers, graph);

  const layers = layersOf(graph);
  const layerOf = (note) => layers.get(note.path);
  const opened = new Set(
    concepts.filter((note) => WRITTEN.has(valueOf(note, "status")) && layerOf(note) !== undefined).map(layerOf),
  );
  const stubs = concepts.filter((note) => valueOf(note, "status") === "stub" && opened.has(layerOf(note)));

  return graded(METRIC.stubsInOpenedLayers, {
    count: stubs.length,
    openedLayers: [...opened].sort((a, b) => a - b),
    notes: stubs.map((note) =>
      offender(note, `is a stub in Layer ${layerOf(note)}, which is open`, { layer: layerOf(note) }),
    ),
  });
}

/**
 * Written Notes with no `interactive` block. A block is counted, never validated: whether
 * it is a valid instance of its Archetype is invariant 9's question.
 */
function archetypeCoverage(written) {
  const without = written.filter(
    (note) => !fencedBlocks(note.frontmatter.body.split(/\r?\n/)).some((block) => languageOf(block) === "interactive"),
  );
  return graded(METRIC.archetypeCoverage, {
    count: without.length,
    of: written.length,
    notes: without.map((note) => offender(note, "has no Interactive")),
  });
}

// ---------------------------------------------------------------------------------------
// The recorded one

/**
 * Floor Notes with a recorded `flagged` verdict. A Floor Note is a concept Note whose
 * `requires` is empty, read from the Notes, so the set to judge is never maintained by hand.
 * The verdicts are never inferred: a Floor Note nobody has judged is unjudged, which is
 * neither plausible nor flagged, and a judgement whose Note is no longer a Floor Note is
 * stale and counts for nothing.
 */
function floorPlausibility(concepts, judgements) {
  const isFloor = (note) => {
    const requires = valueOf(note, "requires");
    return Array.isArray(requires) && requires.length === 0;
  };
  const floors = concepts.filter(isFloor);
  const byName = indexByName(concepts);
  const verdictOf = new Map();
  const stale = [];

  for (const judgement of judgements) {
    const found = byName.get(judgement.note.toLowerCase()) ?? [];
    const where = `${FLOOR_JUDGEMENTS_PATH} line ${judgement.line}`;
    if (found.length !== 1) {
      const why = found.length === 0 ? "names no concept Note" : "names more than one concept Note";
      stale.push({ judgement: judgement.note, line: judgement.line, message: `${where}: [[${judgement.note}]] ${why}` });
    } else if (!isFloor(found[0])) {
      stale.push({
        note: found[0].path,
        line: judgement.line,
        message: `${where}: ${found[0].path} has a non-empty requires, so it is not a Floor Note and its judgement counts for nothing`,
      });
    } else {
      verdictOf.set(found[0].path, judgement);
    }
  }

  const floorNotes = floors.map((note) => {
    const judgement = verdictOf.get(note.path);
    return judgement
      ? { note: note.path, verdict: judgement.verdict, reason: judgement.reason }
      : { note: note.path, verdict: "unjudged", reason: "" };
  });
  const withVerdict = (verdict) => floorNotes.filter((entry) => entry.verdict === verdict);
  const flagged = withVerdict("flagged");

  return graded(METRIC.floorPlausibility, {
    count: flagged.length,
    judged: {
      floorNotes: floorNotes.length,
      plausible: withVerdict("plausible").length,
      flagged: flagged.length,
      unjudged: withVerdict("unjudged").length,
    },
    floorNotes,
    unjudged: withVerdict("unjudged").map(({ note }) => ({
      note,
      message: `${note}: has no recorded judgement; record plausible or flagged in ${FLOOR_JUDGEMENTS_PATH}`,
    })),
    stale,
    notes: flagged.map(({ note, reason }) => ({ note, reason, message: `${note}: flagged above 8th grade: ${reason}` })),
  });
}
