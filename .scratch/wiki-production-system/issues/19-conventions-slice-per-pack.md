# 19: A Conventions slice per Context Pack

**What to build:** A Context Pack carries `wiki/Conventions.md` whole, and the file grows with every curated source: 122 lines after one source, against a budget that has already moved from 120 to 140. On 2026-10-03 the author pinned the budget at 140 as a soft diagnostic in `tests/conventions.test.js` and ruled that the fix is for `generate` to put a slice into each Pack rather than the whole file. This ticket designs and builds the slice.

The open design question is the selection rule. The author's starting position: the whole of the file up to `## Entries`, plus every entry whose heading term, or a symbol in its **This Wiki** line, appears in the Node's Prerequisite Closure Notes or in its own name. Anything a Pack author might write that the slice omitted is reported back, as the house style already says for a symbol the file does not cover.

**Blocked by:** 15

**Status:** done

- [x] `generate --layer N` writes a slice of `Conventions.md` into each Pack in place of the whole file, and says in the Pack that it is a slice and how to ask for more
- [x] The slice is derived from the Node and its Prerequisite Closure, by a rule written down in this ticket before it is coded
- [x] A Pack names every entry the rule left out, so an author who needs one can ask for it by name, with a fixture showing it
- [x] The budget diagnostic in `tests/conventions.test.js` is retired, or re-pointed at the slice size
- [x] The Note Author contract and ADR-0005 say "slice", not "whole"

## Comments

Filed 2026-10-03 from the review of tickets 08 and 14, which both asked for a decision on the budget.

**The rule, ruled by the author on 2026-10-03 and coded in `scripts/lib/conventions-slice.js`.**
A Pack's notation section carries, verbatim and in file order:

1. Everything above `## Entries`: the frontmatter, the one-sentence summary and *How to use this*.
2. The **general entries**, whatever the Node: *Order of operations*, *Brackets*, *Multiplication sign*,
   *Decimal point and digit groups* and *Index and power*. Every Note writes arithmetic. The list is a
   constant in the module; an entry named there that the file lacks is ignored.
3. Any other entry the Node **mentions**. The corpus is the Node's name plus the text of every Note in
   its Prerequisite Closure, frontmatter dropped, nothing copied. An entry is mentioned when the corpus
   holds its heading term as a phrase, or any part of the term where it joins parts with commas or
   "and" (*Decimal point and digit groups* is met by "decimal point"), plural endings dropped
   (*Intervals* is met by "interval"), or any LaTeX command its **This Wiki** line uses other than the
   common ones (`rac`, `\left`, `	ext` and the like): `	an` pulls in *Tangent*, `\infty` *Infinity*.

The Node's own Note is not read: at Pack time it is a stub. Over-inclusion is harmless and accepted; a
prose mention of "limit" in a Floor Note brings *Limit* into Layer 1 Packs, which costs a few lines. The
Pack's intro says it is a slice, how many of how many entries it holds, and names every entry left out,
so an author who needs one asks for it by name, and a symbol in neither place is reported as a gap in the
file, as the house style already says.

On the real vault a Floor Pack carries 5 of 16 entries and a Layer 1 Pack about 10. The byte-for-byte
Pack test and two new tests in `tests/context-packs.test.js` hold the rule: a Floor Node gets the general
entries and what its name says; a Layer 2 Node gets an entry its prerequisite's prerequisite writes with.
The budget test in `tests/conventions.test.js` is retired. ADR-0005 and the Note Author contract say
"slice", and the contract's hand-back now asks for the entries the slice left out that were needed.

**Closed 2026-10-03.**
