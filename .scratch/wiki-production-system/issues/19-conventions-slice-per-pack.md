# 19: A Conventions slice per Context Pack

**What to build:** A Context Pack carries `wiki/Conventions.md` whole, and the file grows with every curated source: 122 lines after one source, against a budget that has already moved from 120 to 140. On 2026-10-03 the author pinned the budget at 140 as a soft diagnostic in `tests/conventions.test.js` and ruled that the fix is for `generate` to put a slice into each Pack rather than the whole file. This ticket designs and builds the slice.

The open design question is the selection rule. The author's starting position: the whole of the file up to `## Entries`, plus every entry whose heading term, or a symbol in its **This Wiki** line, appears in the Node's Prerequisite Closure Notes or in its own name. Anything a Pack author might write that the slice omitted is reported back, as the house style already says for a symbol the file does not cover.

**Blocked by:** 15

**Status:** needs-triage

- [ ] `generate --layer N` writes a slice of `Conventions.md` into each Pack in place of the whole file, and says in the Pack that it is a slice and how to ask for more
- [ ] The slice is derived from the Node and its Prerequisite Closure, by a rule written down in this ticket before it is coded
- [ ] A Pack for a Node that uses an entry the rule omitted reports the omission, with a fixture showing it
- [ ] The budget diagnostic in `tests/conventions.test.js` is retired, or re-pointed at the slice size
- [ ] The Note Author contract and ADR-0005 say "slice", not "whole"

## Comments

Filed 2026-10-03 from the review of tickets 08 and 14, which both asked for a decision on the budget.
