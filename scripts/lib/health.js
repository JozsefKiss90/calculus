// The one computation of the Wiki's health: what `check` gates on and writes to the report,
// and what `generate` renders the dashboard, the index and the log from. There is no second
// implementation, so the human views and the gate cannot disagree (ADR-0002).

import { AnchorGraphError, loadAnchorGraph } from "./anchor-graph.js";
import { CatalogueError, loadCatalogue } from "./archetype-catalogue.js";
import { FloorJudgementError, loadFloorJudgements } from "./floor-judgements.js";
import { GraphError, graphShape, layersOf } from "./graph.js";
import { checkStructuralInvariants } from "./structural-invariants.js";
import { REVIEWERS, STATUSES, checkNoteInvariants, checkReviewFields } from "./note-invariants.js";
import { computeMetrics } from "./metrics.js";
import { checkRawStore, loadRawStore } from "./raw-store.js";
import { buildNotesGraph, isConcept, loadNotes, valueOf, vaultFiles } from "./notes.js";
import { buildErrorReport, buildReport } from "./report.js";

/**
 * The report for a vault: every invariant and metric, or an error report when the graph, the
 * Archetype catalogue or the Floor judgements cannot be read.
 *
 * @param {string} vaultDir
 * @param {object} options
 * @param {string} options.terminalNode the Module's declared Terminal Node
 * @param {string} options.today the date staleness is measured to, as YYYY-MM-DD
 * @param {Awaited<ReturnType<typeof loadNotes>>} [options.notes] the Notes, when the caller
 *   has them as they are about to be rather than as they are on disk
 * @param {string[]} [options.files] every vault file, likewise
 */
export async function assessHealth(vaultDir, { terminalNode, today, notes, files }) {
  let loaded;
  let catalogue;
  let judgements;
  try {
    loaded = await loadAnchorGraph(vaultDir);
    catalogue = await loadCatalogue();
    judgements = await loadFloorJudgements(vaultDir);
  } catch (error) {
    // Only a graph, an Archetype catalogue or a judgements file that cannot be read is a
    // report; anything else is a bug in this tool and should surface as one rather than as a
    // verdict about the Wiki.
    const unreadable = [AnchorGraphError, GraphError, CatalogueError, FloorJudgementError];
    if (!unreadable.some((kind) => error instanceof kind)) throw error;
    return buildErrorReport({ vaultDir, message: error.message });
  }

  const { note, graph } = loaded;
  notes ??= await loadNotes(vaultDir);
  files ??= await vaultFiles(vaultDir);
  return buildReport({
    vaultDir,
    graph: { source: "anchor", note, ...graphShape(graph, terminalNode) },
    notes: { notes: notes.length, conceptNotes: notes.filter(isConcept).length },
    progress: progressOf(notes),
    invariants: [
      ...checkStructuralInvariants(graph, { terminalNode }),
      ...checkNoteInvariants(notes, loaded, catalogue),
      checkRawStore(notes, await loadRawStore(vaultDir)),
      checkReviewFields(notes),
    ],
    metrics: computeMetrics(notes, { files, today, judgements }),
  });
}

/**
 * How far the Module has got: the concept Notes by `status` and by `reviewed_by`, across the
 * Module and per computed Layer. A value outside its closed set is invariant 7's, and is
 * counted in no column. `layers` is empty when the Notes do not form a graph.
 */
function progressOf(notes) {
  const concepts = notes.filter(isConcept);
  const tally = (values, of) => Object.fromEntries(values.map((value) => [value, of.filter((v) => v === value).length]));

  let layers = [];
  try {
    const layerOf = layersOf(buildNotesGraph(notes));
    const byLayer = new Map();
    for (const note of concepts) {
      const layer = layerOf.get(note.path);
      if (layer === undefined) continue;
      byLayer.set(layer, [...(byLayer.get(layer) ?? []), valueOf(note, "status")]);
    }
    layers = [...byLayer.keys()]
      .sort((a, b) => a - b)
      .map((layer) => ({ layer, notes: byLayer.get(layer).length, ...tally(STATUSES, byLayer.get(layer)) }));
  } catch (error) {
    if (!(error instanceof GraphError)) throw error;
  }

  return {
    conceptNotes: concepts.length,
    status: tally(STATUSES, concepts.map((note) => valueOf(note, "status"))),
    reviewedBy: tally(REVIEWERS, concepts.map((note) => valueOf(note, "reviewed_by"))),
    layers,
  };
}
