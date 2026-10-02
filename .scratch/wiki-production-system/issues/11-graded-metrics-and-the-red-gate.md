# 11: Graded metrics and the red gate

**What to build:** The five computed graded metrics, each with its green / yellow / red thresholds and its mandated action per level, written into the machine-readable report and gating the build: broken wikilinks; Notes with zero Cross-references; stale `updated` dates on non-reviewed Notes; Notes still at `stub` after their Layer is opened; and Archetype coverage, meaning Notes with no Interactive. Cross-references are counted, never Edges — the reference wiki's inbound and outbound link floor is impossible for a prerequisite DAG, since Floor Nodes have out-degree zero and the Terminal Node has in-degree zero by definition.

A red metric exits non-zero, which the gate wired in 03 already enforces. Floor plausibility is the sixth row of that table and is deliberately not here: it is a recorded review judgement rather than a computation, and 12 handles it.

**Blocked by:** 05

**Status:** ready-for-human

- [x] Each of the five metrics has fixtures at its green, yellow and red boundaries, asserting both the level in the report and the exit code
- [x] A red metric exits non-zero; a yellow metric exits zero and is visible in both the report and the human summary
- [x] The report states the mandated action for the level each metric is at
- [x] Cross-references and Edges are counted separately, and an Edge never counts as a Cross-reference
- [x] "After their Layer is opened" is derived from computed Layer, not from a declared field
- [x] Archetype coverage counts Notes with no interactive block without validating the blocks, so it does not depend on 09

## Comments

From 11, which implemented it. `check` now grades five metrics after the eleven
invariants, writes them to `report.metrics` with `summary.metrics` counting levels, and
fails on a red metric exactly as on a broken invariant. Every criterion has a test in
`tests/check-metrics.test.js`. The real vault is green on all five.

Two decisions were the author's, asked and answered before implementing:

**A Layer is opened once any concept Note in it is written** (`drafted` or `reviewed`).
Layer is computed in `scripts/lib/metrics.js` as the longest path to the Floor over the
Notes' graph; nothing is declared. The consequence: a Layer drafted one Note per commit
goes red once 4 or more of its Notes are still stubs, so a wide Layer has to land together.
The report lists `openedLayers` and each stub with its Layer.

**The three percentages divide over written concept Notes, not all 61.** A stub has no
prose to hold a link or an Interactive, and the stub metric is what counts stubs. With
nothing written each reads `0 of 0` and is green.

Decisions the ticket forced and the spec did not settle:

**A Cross-reference has no direction.** It counts for both Notes it joins, so a written Note
linked *from* elsewhere has one. A link counts only between two distinct concept Notes that
no Edge joins in either direction, and only in authored text: generated blocks, fenced
blocks, inline code and HTML comments are not read. A Cross-reference to a stub counts.
The metric reports `crossReferences` (distinct pairs) and `edges` side by side.
**Open for the author:** only a *direct* Edge is excluded, as GLOSSARY defines an Edge. A
prose link from the Derivative to a Floor Note it requires only transitively counts as a
Cross-reference, though it arguably makes an ordering claim. Excluding the whole
Prerequisite Closure is a one-line change in `zeroCrossReferences` if that reading is
preferred.

**A broken wikilink is a body link that names no file in the vault**, resolved the way
Obsidian resolves it: any Markdown file by name, ignoring case, folder and `#heading`, or an
attachment by name with extension. `[[#heading]]` is a self-link. It reads every Note's body,
generated blocks included, since a stale generated link is broken in Obsidian too. `requires`
is not read, because an unresolved prerequisite is invariant 5's.

**Stale means `drafted` with `updated` more than 30 calendar days before today**, in local
time as `scaffold` writes dates. Exactly 30 days is not stale. A `reviewed` Note is never
stale. A drafted Note whose `updated` is not a `YYYY-MM-DD` date counts as stale, because it
cannot be shown fresh, and invariant 7 does not check date formats.

**Percentage boundaries are exact.** They are compared as `count × 100` against
`threshold × total`, so 10% of 10 is yellow and 25% is still yellow.

**The mandated actions are this ticket's wording**, since the spec gives only the
thresholds. Each metric carries all three in `actions` and the current one in `action`. The
human summary prints the action and the offending Notes for a yellow or red metric only.

**A metric that needs the Notes' graph is `skipped` when the Notes cannot form one** (two
concept Notes sharing a name). Invariant 11 fails in that case and names why.

**Two older tests asserted "invariants hold" through exit code 0, and no longer can.** A
lone drafted Note is the whole written population, so with no Cross-reference and no
Interactive it is 100% on both and red. `check-notes`' invariant 10 test and ticket 10's
Interactive Author tests now assert `invariantsFailed === 0`. The Interactive Author tests
also assert the run takes the Note off the Archetype coverage list.

**This has a pipeline consequence worth knowing.** A Note committed straight after the Note
Author, before the Interactive Author, can grade red on Archetype coverage, and the
pre-commit hook will refuse it. The Note Author and the Interactive Author should land
together, or a Layer large enough to absorb the percentage should land at once.

Note for 12: Floor plausibility slots in as a sixth entry in `report.metrics` with the same
shape (`level`, `bands`, `action`, `actions`, `notes`), and `buildReport` picks it up.
Note for 17: the dashboard reads `report.metrics` and `summary.metrics`.

Unrelated and still failing: `tests/precommit-and-ci-gate.test.js`'s "CI runs the same npm
scripts" fails on this Windows checkout, because the workflow file has CRLF line endings
and the test's regex expects a bare LF. It fails the same way without this ticket's changes.
