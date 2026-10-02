# 06: Generated prerequisite sections and mini-map

**What to build:** The reverse direction of every Edge appears in the Wiki without any agent writing one. `generate` rewrites three machine-owned blocks in every Note between stable markers: the Builds on section, listing each direct prerequisite as a wikilink with its one-sentence summary; the Required by section, listing each requiring Node with its one-liner; and the local prerequisite mini-map, a flowchart of the Node, its direct prerequisites and its direct dependents. Rewritten idempotently on every run, leaving authored prose untouched.

This is also the half of "add a Node later and tell me what that breaks" that 05 cannot give: 05 enforces, `generate` explains. Re-running it after a graph change produces a reviewable diff showing every shifted Layer and every changed section.

**Blocked by:** 05

**Status:** ready-for-human

- [x] `generate` fills both generated sections correctly for every Note, including the Floor Nodes (nothing to build on) and the Terminal Node (nothing requires it)
- [x] A second run produces an empty diff
- [x] Authored prose outside the markers is byte-identical before and after
- [ ] The mini-map renders in Obsidian and honours the Anchor Graph's edge direction
- [x] Adding a Node, scaffolding it, and re-running `generate` produces a diff confined to the Notes the change actually affects
- [x] `generate` never writes a prerequisite entry; the reverse direction exists only inside the generated blocks
- [x] A hand-edited generated block is overwritten on the next run, and that is documented rather than defended against

## Comments

From 06, which implemented it. `npm run generate` filled all 61 Notes; a second run reports
`no change: all 61 Notes already up to date`, and `check` still passes 9 of 9. The vault
diff adds lines only: no authored line was removed. Every criterion has a test in
`tests/generate.test.js`. One box stays open: the mini-map's edge direction is tested,
but only a human can open Obsidian and see that it renders.

Decisions the ticket forced and the spec did not settle:

**The graph is the Notes' `requires`, not the Anchor Graph.** ADR-0003 says the reverse
direction is generated from the inverted `requires` map, and `generate` uses the same
`buildNotesGraph` `check` does. Where the two sources disagree, invariant 11 fails;
`generate` still writes what the Notes declare rather than refusing, so the diff shows
what they say. A `requires` entry that does not resolve is not drawn (invariant 5 names it).

**The mini-map closes `## Required by`**, after both lists, in its own `mini-map` marker
pair, because it pictures both directions. `scaffold` now writes that pair. The 61 Notes
scaffolded before it existed had it inserted after the `required-by` end marker, which is
what `generate` does for any Note missing it, so no authored text moves.

**Mini-map shape:** `flowchart TD`, the Note as `N` drawn heavier, prerequisites `P1…`,
dependents `D1…`, arrows pointing at the prerequisite as in the Anchor Graph. Every Node
has the `internal-link` class, which Obsidian uses to make a mermaid Node open the Note its
label names. Labels are Note names, so the "over" Notes show their filename spelling.

**Entries:** `- [[Note]] — summary`, or `- [[Note]]` while the summary is empty, as it is
for every stub. Builds on keeps the Note's own `requires` order; Required by is sorted by
name. A multi-line summary is joined into one line. An empty list says so in italics:
*Nothing: this is a Floor Node, knowledge the Module assumes.* and *Nothing in this Module
requires it.* The second does not claim "Terminal Node", because in a vault failing
invariant 2 it could be wrong.

**Broken markers leave the Note alone and exit 1**: a marker missing its partner,
repeated, or out of order. The other Notes are still written, and the output names the
Note and the problem. A graph the Notes cannot form, or a missing vault, exits 2 and
writes nothing.

**The marker format lives in one place**, `scripts/lib/generated-blocks.js`, used by both
`scaffold` and `generate`. The summary reader moved into `notes.js`, so invariant 10 and
`generate` read `## In one sentence` the same way.

**Line endings are preserved, never normalised.** Replacement is by character offset
between the markers, so a CRLF Note stays CRLF and its prose is byte-identical.

**The hand-edit rule is documented** in the README's "Generate the reverse direction"
section, in `generate`'s usage text and in the module header. 13's `wiki/CLAUDE.md` should
repeat it in one line.

Notes for later tickets:

- **"Every shifted Layer" is not in this diff yet.** Layer is computed in 15, and nothing
  generated here shows it. When 15 adds it, a Layer that appears in generated text will
  shift in the diff the way the ticket describes.
- **`check` does not verify that the generated blocks are current.** A stale block passes.
  If that should fail the build, it belongs with 11's graded metrics or a new invariant.
