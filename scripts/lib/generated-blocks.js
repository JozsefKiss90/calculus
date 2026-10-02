// Machine-owned blocks inside a Note: the text between a pair of HTML-comment markers.
//
//   <!-- generated:start builds-on -->
//   ...rewritten on every `generate` run...
//   <!-- generated:end builds-on -->
//
// The markers are the whole contract. `scaffold` writes them empty, `generate` replaces what
// lies between them and nothing else, so authored prose outside them is byte-identical
// after a run — including its line endings, which are never normalised. A hand edit inside
// a block is overwritten on the next run; that is by design, not defended against.
//
// HTML comments are invisible in Obsidian's reading view, so a reader sees only the content.

/** Every generated block, in the order they appear in a Note. */
export const BLOCKS = ["builds-on", "required-by", "mini-map"];

export const startMarker = (name) => `<!-- generated:start ${name} -->`;
export const endMarker = (name) => `<!-- generated:end ${name} -->`;

/** A block as `scaffold` writes it: both markers, nothing between them. */
export const emptyBlock = (name) => `${startMarker(name)}\n${endMarker(name)}`;

/**
 * Replace the contents of each named block. A block missing from the Note is inserted
 * after the block named in its `after`, so a marker pair introduced after a Note was
 * scaffolded reaches it without touching authored text.
 *
 * @param {string} source the whole Note
 * @param {{name: string, content: string, after?: string}[]} blocks content without the
 *   markers, as LF-separated lines; written with the Note's own line ending
 * @returns {{text: string} | {problems: string[]}}
 */
export function rewriteBlocks(source, blocks) {
  let text = source;
  const problems = [];

  for (const { name, content, after } of blocks) {
    let found = locate(text, name);
    if (found.missing && after !== undefined) {
      const anchor = locate(text, after);
      if (!anchor.missing && !anchor.problem) {
        const eol = anchor.eol || "\n";
        const inserted = `${eol}${eol}${startMarker(name)}${eol}${endMarker(name)}`;
        text = text.slice(0, anchor.endMarkerEnd) + inserted + text.slice(anchor.endMarkerEnd);
        found = locate(text, name);
      }
    }
    if (found.missing) {
      problems.push(`has no ${startMarker(name)} … ${endMarker(name)} block`);
      continue;
    }
    if (found.problem) {
      problems.push(found.problem);
      continue;
    }

    const eol = found.eol;
    const body = content === "" ? eol : `${eol}${content.split("\n").join(eol)}${eol}`;
    text = text.slice(0, found.startMarkerEnd) + body + text.slice(found.endLineStart);
  }

  return problems.length > 0 ? { problems } : { text };
}

/**
 * Where one block's markers sit. Each marker must be alone on its line, once, the start
 * before the end; anything else is a problem rather than a guess at what was meant.
 */
function locate(text, name) {
  const starts = markerLines(text, startMarker(name));
  const ends = markerLines(text, endMarker(name));
  if (starts.length === 0 && ends.length === 0) return { missing: true };
  if (starts.length !== 1 || ends.length !== 1) {
    return {
      problem: `the ${name} block's markers must appear once each, and there are ${starts.length} start and ${ends.length} end markers`,
    };
  }
  const [start] = starts;
  const [end] = ends;
  if (end.lineStart < start.lineEnd) return { problem: `the ${name} block ends before it starts` };

  const eol = text.slice(start.lineEnd).startsWith("\r\n") ? "\r\n" : "\n";
  return {
    eol,
    // Just after the start marker's text, before its line ending.
    startMarkerEnd: start.lineEnd,
    // The beginning of the end marker's line, so its indentation is kept.
    endLineStart: end.lineStart,
    endMarkerEnd: end.lineEnd,
  };
}

function markerLines(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^[ \\t]*${escaped}[ \\t]*(?=\\r?$)`, "gm");
  return [...text.matchAll(pattern)].map((match) => ({
    lineStart: match.index,
    lineEnd: match.index + match[0].length,
  }));
}
