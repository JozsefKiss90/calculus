// The three human-facing views `generate` writes into the vault — `index.md`, the Graph
// Health Dashboard and `log.md` — all rendered from one run of the computation `check` gates
// on, so none of them holds a count of its own (ADR-0002).
//
// The report is computed for the vault as these files will leave it, not as it was. All
// three are counted as files a link can name, and the dashboard, a Note, is read as its
// shell: its frontmatter and opening, which never change. Its body adds nothing to the report
// of its own (dashboard.js), so the dashboard written here and the report a `check` straight
// after computes are the same numbers, on the first run and after a Note is deleted alike.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import { readFrontmatter } from "./frontmatter.js";
import { FLOOR_JUDGEMENTS_PATH } from "./floor-judgements.js";
import { GraphError, layersOf } from "./graph.js";
import { assessHealth } from "./health.js";
import { buildNotesGraph, isConcept, loadNotes, valueOf, vaultFiles } from "./notes.js";
import { DASHBOARD_PATH, dashboardShell, renderDashboard } from "./dashboard.js";
import { LOG_PATH, nextLog } from "./log.js";
import { INDEX_PATH, renderIndex } from "./wiki-index.js";

export const VIEW_PATHS = [INDEX_PATH, DASHBOARD_PATH, LOG_PATH];

/**
 * @param {string} vaultDir
 * @param {object} options
 * @param {string} options.terminalNode the Module's declared Terminal Node
 * @param {string} options.today the date of the run, as YYYY-MM-DD
 * @param {{layer: number, nodes: number}} [options.packs] the Layer whose Context Packs this
 *   run wrote, for the log
 * @returns {Promise<{written: string[], unchanged: string[], report: object}>}
 */
export async function writeViews(vaultDir, { terminalNode, today, packs }) {
  const existing = new Map();
  for (const path of VIEW_PATHS) existing.set(path, await readOptional(join(vaultDir, path)));

  const oldDashboard = existing.get(DASHBOARD_PATH);
  const oldFrontmatter = oldDashboard === undefined ? null : readFrontmatter(oldDashboard);
  const dateIn = (key) => {
    const value = oldFrontmatter?.entries.get(key)?.value;
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
  };
  const kept = { created: dateIn("created") ?? today, updated: dateIn("updated") ?? today };

  const notes = withDashboardShell(await loadNotes(vaultDir), dashboardShell(kept));
  const files = [...new Set([...(await vaultFiles(vaultDir)), ...VIEW_PATHS])].sort();
  const report = await assessHealth(vaultDir, { terminalNode, today, notes, files });

  let layers = new Map();
  try {
    layers = layersOf(buildNotesGraph(notes));
  } catch (error) {
    if (!(error instanceof GraphError)) throw error;
  }

  const byPath = new Map(notes.map((note) => [note.path, note]));
  const linkTo = (path) => (byPath.has(path) ? `[[${byPath.get(path).name}]]` : undefined);
  // `updated` moves only when what the dashboard says does.
  let dashboard = renderDashboard(report, kept, linkTo);
  if (oldDashboard !== undefined && lf(oldDashboard) !== dashboard) {
    dashboard = renderDashboard(report, { ...kept, updated: today }, linkTo);
  }

  const present = new Set(files);
  const extras = [LOG_PATH, "CLAUDE.md", FLOOR_JUDGEMENTS_PATH].filter((path) => present.has(path));
  const oldLog = existing.get(LOG_PATH);
  const states = notes.filter(isConcept).map((note) => ({
    path: note.path,
    name: note.name,
    layer: layers.get(note.path),
    status: String(valueOf(note, "status") ?? "unset"),
    reviewedBy: String(valueOf(note, "reviewed_by") ?? "unset"),
  }));

  const rendered = new Map([
    [INDEX_PATH, renderIndex({ report, notes, layers, extras })],
    [DASHBOARD_PATH, dashboard],
    [LOG_PATH, nextLog(oldLog === undefined ? undefined : lf(oldLog), { report, notes: states, today, packs })],
  ]);

  const written = [];
  const unchanged = [];
  for (const [path, text] of rendered) {
    const before = existing.get(path);
    // A clone that checks files out with CRLF keeps them so; only the content is compared.
    const out = before?.includes("\r\n") ? text.replace(/\n/g, "\r\n") : text;
    if (out === before) {
      unchanged.push(path);
      continue;
    }
    await mkdir(dirname(join(vaultDir, path)), { recursive: true });
    await writeFile(join(vaultDir, path), out, "utf8");
    written.push(path);
  }
  return { written, unchanged, report };
}

/** The Notes with the dashboard read as its shell, in its place or added when it is new. */
function withDashboardShell(notes, shell) {
  const directory = posix.dirname(DASHBOARD_PATH);
  const note = {
    path: DASHBOARD_PATH,
    name: posix.basename(DASHBOARD_PATH, ".md"),
    directory: posix.basename(directory),
    frontmatter: readFrontmatter(shell),
  };
  const at = notes.findIndex((entry) => entry.path === DASHBOARD_PATH);
  return at === -1 ? [...notes, note] : notes.with(at, note);
}

const lf = (text) => text.replace(/\r\n/g, "\n");

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}
