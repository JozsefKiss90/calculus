// Invariants 5, 6, 7 and 10, computed from the Notes, and invariant 11, which joins the
// Notes to the Anchor Graph.
//
// Every failure names the Note it is about in `note` and says what went wrong in
// `problem`, a stable slug, so an agent can act on a report without parsing prose and two
// different mistakes on one Note never read as one.
//
// Invariant 11 is what makes "agents never change the structure" enforceable. A Node is
// legitimately added to one side before the other, so a mismatch is reported as both
// directions, each its own failure, and the side with nothing missing says so: a report
// that only ever showed one direction would read as a bug in the check.

import { GraphError } from "./graph.js";
import { noteNameFor } from "./note-names.js";
import { CONCEPT, SUMMARY_HEADING, buildNotesGraph, indexByName, isConcept, resolveLink, summaryOf, valueOf } from "./notes.js";

const INVARIANT = {
  requiresResolve: {
    id: 5,
    name: "requires-resolve",
    title: "Every requires entry resolves to an existing Note",
  },
  domainMatchesDirectory: {
    id: 6,
    name: "domain-matches-directory",
    title: "Every domain equals its containing directory",
  },
  frontmatterConforms: {
    id: 7,
    name: "frontmatter-conforms",
    title: "No frontmatter key outside the schema; no enum value outside its closed set",
  },
  summaryBeforeDrafted: {
    id: 10,
    name: "summary-before-drafted",
    title: "Every Note at status drafted or above has a non-empty ## In one sentence",
  },
  notesMatchAnchorGraph: {
    id: 11,
    name: "notes-match-anchor-graph",
    title: "The graph built from the Notes' requires is identical to the Anchor Graph",
  },
};

/**
 * The frontmatter schema (ADR-0003). `values` closes an enum; `list` marks an array of
 * scalars; `only` limits a key to one `kind` of Note.
 */
const SCHEMA = {
  kind: { required: true, values: [CONCEPT, "source", "reference", "observability"] },
  domain: { required: true },
  requires: { required: true, list: true },
  status: { required: true, values: ["stub", "drafted", "reviewed"] },
  reviewed_by: { required: true, values: ["none", "agent", "human"] },
  created: { required: true },
  updated: { required: true },
  aliases: { list: true },
  tags: { list: true },
  source_file: { only: "source" },
  source_type: { only: "source" },
  date_ingested: { only: "source" },
};

/** The statuses at which a Note's one-sentence summary has to exist. */
const SUMMARISED = new Set(["drafted", "reviewed"]);

/**
 * @param {Awaited<ReturnType<typeof import("./notes.js").loadNotes>>} notes
 * @param {{graph: object}} anchor what `loadAnchorGraph` returned
 */
export function checkNoteInvariants(notes, anchor) {
  return [
    requiresResolve(notes),
    domainMatchesDirectory(notes),
    frontmatterConforms(notes),
    summaryBeforeDrafted(notes),
    notesMatchAnchorGraph(notes, anchor.graph),
  ];
}

const verdict = (invariant, failures) => ({
  ...invariant,
  status: failures.length === 0 ? "pass" : "fail",
  failures,
});

const failure = (note, problem, message) => ({ problem, note: note.path, message: `${note.path}: ${message}` });

function requiresResolve(notes) {
  const byName = indexByName(notes);
  const failures = [];

  for (const note of notes) {
    const requires = valueOf(note, "requires");
    if (!Array.isArray(requires)) continue;
    if (!isConcept(note)) {
      if (requires.length > 0) {
        failures.push(
          failure(note, "prerequisite-outside-concept", `is kind: ${valueOf(note, "kind")}, and only a concept Note declares prerequisites, but requires lists ${requires.join(", ")}`),
        );
      }
      continue;
    }

    for (const entry of requires) {
      const resolved = resolveLink(entry, byName);
      if (resolved.notWikilink) {
        failures.push(failure(note, "prerequisite-not-a-wikilink", `requires "${entry}", which is not a [[wikilink]]`));
      } else if (resolved.notes.length === 0) {
        failures.push(failure(note, "unresolved-prerequisite", `requires [[${resolved.target}]], and no Note has that name`));
      } else if (resolved.notes.length > 1) {
        failures.push(
          failure(note, "ambiguous-prerequisite", `requires [[${resolved.target}]], which names ${resolved.notes.length} Notes: ${resolved.notes.map((n) => n.path).join(", ")}`),
        );
      } else if (!isConcept(resolved.notes[0])) {
        failures.push(
          failure(note, "prerequisite-not-a-concept", `requires [[${resolved.target}]], which is ${resolved.notes[0].path}, a kind: ${valueOf(resolved.notes[0], "kind")} Note rather than a concept`),
        );
      }
    }
  }
  return verdict(INVARIANT.requiresResolve, failures);
}

function domainMatchesDirectory(notes) {
  const failures = [];
  for (const note of notes) {
    const domain = valueOf(note, "domain");
    // A missing or malformed domain is invariant 7's to name.
    if (typeof domain !== "string" || domain === note.directory) continue;
    failures.push(failure(note, "domain-mismatch", `domain is "${domain}", but the Note is in ${note.directory}`));
  }
  return verdict(INVARIANT.domainMatchesDirectory, failures);
}

function frontmatterConforms(notes) {
  const failures = [];
  for (const note of notes) {
    const { entries, problems } = note.frontmatter;
    for (const { line, message } of problems) {
      failures.push(failure(note, "unreadable-frontmatter", line === undefined ? message : `line ${line}: ${message}`));
    }

    const kind = valueOf(note, "kind");
    for (const [key, entry] of entries) {
      if (!Object.hasOwn(SCHEMA, key)) {
        failures.push(failure(note, "undeclared-key", `${key} is not a frontmatter key in the schema`));
        continue;
      }
      const rule = SCHEMA[key];
      if (rule.only && kind !== rule.only) {
        failures.push(failure(note, "undeclared-key", `${key} belongs only on a kind: ${rule.only} Note, and this one is kind: ${kind}`));
        continue;
      }
      if (entry.unreadable) continue;
      if (entry.value === null) {
        failures.push(failure(note, rule.required ? "missing-key" : "wrong-shape", `${key} has no value`));
      } else if (rule.list && !Array.isArray(entry.value)) {
        failures.push(failure(note, "wrong-shape", `${key} must be a list, and is "${entry.value}"`));
      } else if (!rule.list && Array.isArray(entry.value)) {
        failures.push(failure(note, "wrong-shape", `${key} must be a single value, and is a list`));
      } else if (rule.values && !rule.values.includes(entry.value)) {
        failures.push(
          failure(note, "out-of-enum-value", `${key} is "${entry.value}", which is not one of ${rule.values.join(", ")}`),
        );
      }
    }

    for (const [key, rule] of Object.entries(SCHEMA)) {
      if (rule.required && !entries.has(key)) {
        failures.push(failure(note, "missing-key", `${key} is required and absent`));
      }
    }

    failures.push(...repeatedPrerequisites(note));
  }
  return verdict(INVARIANT.frontmatterConforms, failures);
}

function repeatedPrerequisites(note) {
  const requires = valueOf(note, "requires");
  if (!Array.isArray(requires)) return [];
  const seen = new Set();
  const repeated = new Set();
  for (const entry of requires) {
    const { target } = resolveLink(entry, new Map());
    const key = target.toLowerCase();
    if (seen.has(key)) repeated.add(target);
    seen.add(key);
  }
  return [...repeated].map((target) => failure(note, "duplicate-prerequisite", `requires lists [[${target}]] more than once`));
}

function summaryBeforeDrafted(notes) {
  const failures = [];
  for (const note of notes) {
    const status = valueOf(note, "status");
    if (!SUMMARISED.has(status)) continue;
    const summary = summaryOf(note);
    if (summary === undefined) {
      failures.push(failure(note, "missing-summary", `is status: ${status} and has no ## ${SUMMARY_HEADING} section`));
    } else if (summary === "") {
      failures.push(failure(note, "empty-summary", `is status: ${status} and its ## ${SUMMARY_HEADING} is empty`));
    }
  }
  return verdict(INVARIANT.summaryBeforeDrafted, failures);
}

function notesMatchAnchorGraph(notes, anchorGraph) {
  if (!notes.some(isConcept)) {
    // Before `scaffold` has run there is nothing to compare, and invariants 1 to 4 are the
    // whole gate. Skipped rather than passed, so the report never claims a match it did
    // not check.
    return {
      ...INVARIANT.notesMatchAnchorGraph,
      status: "skipped",
      reason: "the vault has no concept Notes yet; scaffold creates them from the Anchor Graph",
      failures: [],
    };
  }

  let notesGraph;
  try {
    notesGraph = buildNotesGraph(notes);
  } catch (error) {
    if (!(error instanceof GraphError)) throw error;
    return verdict(INVARIANT.notesMatchAnchorGraph, [
      { problem: "notes-graph-unbuildable", message: `the Notes do not form a graph: ${error.message}` },
    ]);
  }

  // The Anchor Graph's names in the spelling a Note's filename uses, so a Node whose name
  // cannot be a filename as is still meets its Note.
  const spelled = (name) => {
    const noteName = noteNameFor(name);
    return typeof noteName === "string" ? noteName : name;
  };
  const anchor = shapeOf(anchorGraph, spelled);
  const fromNotes = shapeOf(notesGraph, (name) => name);

  const anchorOnly = difference(anchor, fromNotes);
  const notesOnly = difference(fromNotes, anchor);
  if (anchorOnly.nodes.length === 0 && anchorOnly.edges.length === 0 && notesOnly.nodes.length === 0 && notesOnly.edges.length === 0) {
    return verdict(INVARIANT.notesMatchAnchorGraph, []);
  }

  return verdict(INVARIANT.notesMatchAnchorGraph, [
    {
      problem: "in-anchor-graph-not-notes",
      direction: "in the Anchor Graph but not the Notes",
      nodes: anchorOnly.nodes,
      edges: anchorOnly.edges,
      message: describe("in the Anchor Graph but not the Notes", anchorOnly, {
        node: (name) => `Node "${name}" has no Note; scaffold creates it`,
        edge: (edge) => `Edge "${edge.from}" requires "${edge.to}" is not in ${edge.from}'s requires`,
      }),
    },
    {
      problem: "in-notes-not-anchor-graph",
      direction: "in the Notes but not the Anchor Graph",
      nodes: notesOnly.nodes,
      edges: notesOnly.edges,
      message: describe("in the Notes but not the Anchor Graph", notesOnly, {
        node: (name) => `concept Note "${name}" is no Node of the Anchor Graph`,
        edge: (edge) => `"${edge.from}" requires "${edge.to}", an Edge the Anchor Graph does not have`,
      }),
    },
  ]);
}

/** A graph as sets of names, so two graphs built from different sources compare. */
function shapeOf(graph, spell) {
  const name = (id) => spell(graph.nameOf(id));
  return {
    nodes: new Set(graph.nodes.map((node) => name(node.id))),
    edges: new Map(
      graph.edges.map((edge) => {
        const named = { from: name(edge.from), to: name(edge.to) };
        return [`${named.from}\n${named.to}`, named];
      }),
    ),
  };
}

function difference(a, b) {
  const byName = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
  return {
    nodes: [...a.nodes].filter((name) => !b.nodes.has(name)).sort(byName),
    edges: [...a.edges]
      .filter(([key]) => !b.edges.has(key))
      .map(([, edge]) => edge)
      .sort((x, y) => byName(x.from, y.from) || byName(x.to, y.to)),
  };
}

function describe(direction, { nodes, edges }, phrase) {
  if (nodes.length === 0 && edges.length === 0) return `${direction}: nothing`;
  return `${direction}: ${[...nodes.map(phrase.node), ...edges.map(phrase.edge)].join("; ")}`;
}
