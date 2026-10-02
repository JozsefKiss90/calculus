// Fenced code blocks, found the way Obsidian finds them. Shared by invariant 8, which must not
// read a dollar sign inside one as mathematics, and invariant 9, which validates the ones
// whose language is `interactive` — so the two cannot disagree about where a block ends.
//
// A fence is three or more backticks or tildes, indented at most three spaces. It is closed
// by a line holding only a run of the same character at least as long. One never closed runs
// to the end of the Note, as it does on the page. A fence inside another, longer one is
// content, which is how a Note shows an example of a block without being one.

/**
 * @param {string[]} lines
 * @returns {{open: number, close: number, info: string}[]} line indexes; `close` is -1 for a
 *   block never closed. `info` is the opening line's text after the fence, trimmed.
 */
export function fencedBlocks(lines) {
  const blocks = [];
  let current = null;
  let marker = null;
  for (const [index, line] of lines.entries()) {
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (current === null) {
      if (fence === null) continue;
      marker = fence[1];
      current = { open: index, close: -1, info: fence[2].trim() };
    } else if (fence !== null && fence[1][0] === marker[0] && fence[1].length >= marker.length && line.trim() === fence[1]) {
      current.close = index;
      blocks.push(current);
      current = null;
    }
  }
  if (current !== null) blocks.push(current);
  return blocks;
}

/** A fenced block's language: the first word of its info string. */
export const languageOf = (block) => block.info.split(/\s+/)[0];
