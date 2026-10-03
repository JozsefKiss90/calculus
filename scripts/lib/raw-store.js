// Invariant 12: the raw store is immutable, and every source Note cites a file in it.
//
// `raw/` sits beside the vault, outside it, as `.wiki-health/` does. A Source Curator writes
// an extract there once and records its SHA-256 in `raw/checksums.sha256`, in the format
// `sha256sum -c` reads, so a human can verify the store without this tool. Nothing edits an
// extract afterwards; if a source changes, it is extracted again as a new file.
//
// The checksum is what makes "immutable" checkable rather than conventional. A tracked file
// whose bytes differ from its checksum, or that has gone, fails. So does a file nobody
// tracked, because a file without a checksum is one an edit would pass unnoticed. Bytes are
// compared exactly, which is why `.gitattributes` marks `raw/**` `-text`: a clone that
// rewrote line endings would otherwise change every extract.
//
// A store that does not exist is an empty one, and holds: until a reference is curated there
// is nothing to protect. A source Note that cites a file in it then fails here.

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { filesUnder, valueOf } from "./notes.js";

export const RAW_DIRECTORY = "raw";
const CHECKSUMS = "checksums.sha256";
/** Files in `raw/` that describe the store rather than belong to it. */
const NOT_EXTRACTS = new Set([CHECKSUMS, "README.md"]);

const INVARIANT = {
  id: 12,
  name: "raw-store-unchanged",
  title: "Every raw file is tracked and unchanged, and every source Note's source_file names one",
};

/** `<sha256>  <path>`, or `<sha256> *<path>` as `sha256sum --binary` writes it. */
const CHECKSUM_LINE = /^([0-9a-f]{64}) [ *](.+)$/;

/**
 * The raw store beside a vault: each file in it with its SHA-256, and the checksums recorded
 * for them. Paths are relative to `raw/`, with forward slashes.
 *
 * @returns {Promise<{
 *   files: Map<string, string>,
 *   checksums: {path: string, sha256: string, line: number}[],
 *   unreadable: {line: number, text: string}[],
 * }>}
 */
export async function loadRawStore(vaultDir) {
  const rawDir = join(dirname(resolve(vaultDir)), RAW_DIRECTORY);
  const files = new Map();
  const paths = await filesUnder(rawDir).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  for (const path of paths) {
    if (NOT_EXTRACTS.has(path)) continue;
    files.set(path, createHash("sha256").update(await readFile(join(rawDir, path))).digest("hex"));
  }

  const checksums = [];
  const unreadable = [];
  const text = await readFile(join(rawDir, CHECKSUMS), "utf8").catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (line.trim() === "" || line.startsWith("#")) continue;
    const match = CHECKSUM_LINE.exec(line.trimEnd());
    if (match) checksums.push({ sha256: match[1], path: match[2], line: index + 1 });
    else unreadable.push({ line: index + 1, text: line.trim() });
  }
  return { files, checksums, unreadable };
}

/**
 * @param {Awaited<ReturnType<typeof import("./notes.js").loadNotes>>} notes
 * @param {Awaited<ReturnType<typeof loadRawStore>>} store
 */
export function checkRawStore(notes, store) {
  const shown = (path) => `${RAW_DIRECTORY}/${path}`;
  const failures = [];
  const fileFailure = (problem, path, message, details = {}) => ({
    problem,
    file: shown(path),
    ...details,
    message: `${shown(path)}: ${message}`,
  });

  for (const { line, text } of store.unreadable) {
    failures.push(
      fileFailure("unreadable-checksum", CHECKSUMS, `line ${line} is not "<sha256>  <file>": ${text}`, { line }),
    );
  }

  const tracked = new Map();
  for (const { path, sha256, line } of store.checksums) {
    if (tracked.has(path)) {
      failures.push(fileFailure("raw-file-tracked-twice", path, `has two checksums, on lines ${tracked.get(path)} and ${line} of ${CHECKSUMS}`));
      continue;
    }
    tracked.set(path, line);
    const actual = store.files.get(path);
    if (actual === undefined) {
      failures.push(fileFailure("raw-file-missing", path, `is tracked in ${CHECKSUMS} and no longer exists`));
    } else if (actual !== sha256) {
      failures.push(
        fileFailure("raw-file-changed", path, `its content has changed since it was extracted: sha256 ${actual}, tracked as ${sha256}`, {
          expected: sha256,
          actual,
        }),
      );
    }
  }

  for (const path of store.files.keys()) {
    if (tracked.has(path)) continue;
    failures.push(fileFailure("raw-file-untracked", path, `has no checksum in ${CHECKSUMS}, so nothing would notice it change`));
  }

  for (const note of notes) {
    if (valueOf(note, "kind") !== "source") continue;
    const sourceFile = valueOf(note, "source_file");
    // A missing or malformed source_file is invariant 7's to name.
    const path = typeof sourceFile === "string" ? rawPathOf(sourceFile) : undefined;
    if (path === undefined || store.files.has(path)) continue;
    failures.push({
      problem: "unresolved-source-file",
      note: note.path,
      file: sourceFile,
      message: `${note.path}: source_file is ${sourceFile}, and no such file exists in ${RAW_DIRECTORY}/`,
    });
  }

  return { ...INVARIANT, status: failures.length === 0 ? "pass" : "fail", failures };
}

/**
 * The path inside `raw/` a `source_file` names, or undefined when it names nothing there:
 * it must start `raw/`, use forward slashes, and never climb out with `..`.
 */
export function rawPathOf(sourceFile) {
  const prefix = `${RAW_DIRECTORY}/`;
  if (!sourceFile.startsWith(prefix) || sourceFile.includes("\\")) return undefined;
  const path = sourceFile.slice(prefix.length);
  const segments = path.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) return undefined;
  if (NOT_EXTRACTS.has(path)) return undefined;
  return path;
}
