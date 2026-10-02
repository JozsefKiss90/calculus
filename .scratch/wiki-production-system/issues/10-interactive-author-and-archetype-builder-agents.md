# 10: Interactive Author and Archetype Builder agent contracts

**What to build:** Two agent contracts, both built on a catalogue that is now reviewed and a validator that now runs. The Interactive Author takes one drafted Note plus the Archetype parameter schemas and writes interactive blocks into it: it reads the Note first so the Interactive fits what was actually written, it writes a declarative specification rather than rendering code, and it reports that no Archetype fits rather than forcing a bad one. The Archetype Builder takes a named catalogue gap and produces one new Archetype's schema, which is how the closed set grows deliberately instead of becoming a cage.

Neither agent sets `status` or `reviewed_by`.

**Blocked by:** 08, 09

**Status:** ready-for-human

- [x] The Interactive Author's input contract is exactly one drafted Note plus the Archetype schemas; it does not read the rest of the Wiki
- [x] Its output passes invariant 9 validation
- [x] It has a defined way to report "no Archetype fits" that reaches a human, and it never silently picks the nearest one
- [x] The Archetype Builder's input is a named gap and its output is one schema in the catalogue's existing shape
- [x] Neither contract permits setting `status` or `reviewed_by`
- [x] Running the Interactive Author against a Note drafted by hand produces a block that validates

## Comments

**Where they live.** `.claude/agents/interactive-author.md` and
`.claude/agents/archetype-builder.md`. Each is a runnable subagent definition and the contract
itself, so there is no second copy to drift. The catalogue's "A closed set" section now points
at them and says where gaps go.

**The Interactive Author.**
- It reads the Note and `docs/archetype-catalogue.md` and nothing else.
- It works only on a Note at `kind: concept`, `status: drafted`, `reviewed_by: none`. Any other
  state means the Note is not ready, or review has begun on the Note as it stands. Then it
  stops and changes nothing.
- Each case ends in one of three outcomes:
  - **fit**: it writes a block that uses the Note's own numbers;
  - **gap**: it files a gap and writes no block;
  - **none warranted**: no block, with the reason given in its reply. A hub Note is the usual
    case.
- A "fit" is defined so that the nearest-but-wrong Archetype counts as a gap. One example is
  an Archetype that fits only if the Note's numbers or notation are changed.
- It changes only the blocks it adds and `updated`, and it loops on `check` until invariant 9
  has no failure naming its Note.

**How "no Archetype fits" reaches a human.** A gap is a ticket in the existing tracker at
`.scratch/archetype-gaps/issues/NN-<gap-name>.md`, `Status: needs-triage`. It quotes the
passage it would sit beside, lists each near Archetype and what it cannot show, and describes
in plain words what a new one would hold. A second Note with the same need is added to the
open gap rather than filed again. When the author triages a gap to `ready-for-agent`, that gap
is the Builder's input. `wontfix` means the Note goes without.

**The Archetype Builder.**
- It runs only on a gap at `ready-for-agent`.
- It appends one `### <name>` section at the end of `## Archetypes`, using only the existing
  types, composites, families and Range terms. If those cannot express the gap, it changes
  nothing and says what the grammar lacks.
- It validates with the catalogue test, the catalogue-examples test and `check`.
- It sets the gap to `ready-for-human` and leaves the change uncommitted for the author to
  review.
- It writes no Note.

**Neither sets `status` or `reviewed_by`.** The Interactive Author's contract names both as
fields it must leave alone, and says a finished Note is still `drafted`/`none`. The Builder
touches no Note at all.

**Run against a hand-drafted Note.** *Coordinates, tables, and plotting* was drafted by hand at
`status: drafted`, with $y = x^2$ as its worked example (not the catalogue's $y = 2x + 1$). The
Interactive Author ran against a throwaway copy of the repo. It chose `grid-plotter`
`plot-from-table` with the Note's own five points and placed it after the worked example
paragraph. `check` passed. The input and output are kept in `tests/fixtures/interactive-author/`.
`tests/interactive-author.test.js` asserts that the output passes `check` with invariant 9
holding, and that it differs from the input only by the block (and `updated`), so neither
status field changed. When the catalogue changes, re-run the agent and replace the output.

**Also exercised, in throwaway copies only (nothing committed):**
- The Interactive Author on a hand-drafted *Inputs, outputs, and composition*. It filed
  `01-function-machine` as a gap and wrote no block. Its reasons: `function-plot` hides the
  intermediate output, `grid-plotter` has no rule, and `expression-stepper` steps are rewrites,
  not a number passing through.
- With that gap accepted, the Archetype Builder wrote a `function-machine` Archetype. Each
  machine is an existing `function` plus a plain-words `text` name, with `swap`,
  `show-steps` and two examples from the Note. It validated.

That run caught two tests that hard-coded "exactly thirteen" and would have failed the first
real addition. Both are fixed:
- `archetype-catalogue.test.js` now fixes the thirteen as the first entries, and checks that an
  appended Archetype is read last.
- `check-interactives.test.js` now requires an example for every Archetype heading, however
  many there are.

**For the author to rule on:**
- **No Interactive after agent review.** The Interactive Author refuses a Note already at
  `reviewed_by: agent`. Adding a block after review would bypass the review. This orders the
  pipeline Note Author → Interactive Author → Correctness Reviewer, as ticket 18 lists it.
  Re-running after a new Archetype lands means resetting `reviewed_by` by hand.
- **The Note Author has no marker yet** for where an Interactive belongs (story 36). Until 15
  defines one, the Interactive Author places blocks by reading the prose.
- **The trial `function-machine` Archetype is not proposed.** It is a candidate for the gap 08
  already named. If you want it, run the Interactive Author on the real Note once it is
  drafted.
- **The Builder writes Archetypes only, never grammar.** The catalogue used to say that a new
  composite type or function family "is added the same way". It now says that is the author's
  decision, and the Builder stops and comments rather than adding one. This narrows story 25
  on purpose: one gap gives one schema, and the grammar changes only by your hand. Revert the
  sentence if you want the Builder to be able to add a family as well.
- **The kept run does not show the `updated` rule.** The Note was drafted on the day of the
  run, so `updated` was already today's date. The test allows `updated` to change and nothing
  else.
- **`npm test` does not run on this machine's Node 20.11.** The `tests/**/*.test.js` glob needs
  Node 22, which `engines` already asks for. The suite was run as `node --test tests/*.test.js`:
  every test passes except the CRLF one that 09 recorded as pre-existing.
