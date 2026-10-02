// How a Node's name becomes the name of the Note that carries it. Shared by `scaffold`,
// which names the files, and by invariant 11, which compares the Anchor Graph's names with
// the Notes' names and so has to spell them the same way.

/**
 * Characters a filename or a wikilink cannot hold, and how a name spells each out. Only `/`
 * has a spelling, because only `/` has one that reads as the mathematics did; anything else
 * is refused rather than given a spelling nobody chose.
 */
const SPELLED_OUT = { "/": "over" };
const ILLEGAL_IN_FILENAME = /[\\/:*?"<>|#^[\]]/g;

/**
 * The name of the Note that carries a Node: its name, with every character a filename
 * cannot hold spelled out. `requires` links to this, so it is also how a Note is linked.
 *
 * @returns {string | {unspellable: string[]}}
 */
export function noteNameFor(nodeName) {
  const unspellable = [...new Set(nodeName.match(ILLEGAL_IN_FILENAME) ?? [])].filter(
    (character) => !(character in SPELLED_OUT),
  );
  if (unspellable.length > 0) return { unspellable };
  return nodeName.replace(ILLEGAL_IN_FILENAME, (character) => SPELLED_OUT[character]);
}
