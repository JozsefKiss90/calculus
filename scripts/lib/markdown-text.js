// Text from the report written into Markdown the vault reads back. Escaped so that it is only
// ever text: a broken link's target never becomes a link the dashboard itself breaks, a `$`
// never opens maths invariant 8 would parse, and a `|` never splits a table cell.

/** Arbitrary text as Markdown that renders as exactly that text. */
export const escapeText = (text) => String(text).replace(/[\\`*_[\]<>|$#]/g, "\\$&");

/** `1 Note`, `2 Notes`. */
export const counted = (count, singular, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;
