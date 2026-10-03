# 18: One Floor Note end to end

**What to build:** The acceptance test for the whole spec. One Layer 0 Note taken the full distance: scaffolded as a stub, a Pack generated for it, drafted by a Note Author from that Pack alone, given an Interactive by an Interactive Author reading the drafted Note, reviewed by a Correctness Reviewer from its bundle, and signed off by the author at `status: reviewed` and `reviewed_by: human`. `check` green throughout, with the dashboard and the log reflecting each transition.

This is the only ticket that answers the question the project turns on: does this pipeline produce a Note worth learning from? It sits behind the whole graph, which is why the hand-walk checkpoint after 04 exists — to surface a fundamental problem long before this ticket would.

**Blocked by:** 10, 12, 15, 16, 17

**Status:** done

- [x] One Floor Note reaches `status: reviewed` and `reviewed_by: human` through every stage, with no stage skipped and no hand-patching of a generated block
- [x] `check` exits 0 at every stage, and the dashboard and log show each transition
- [x] The Note is readable and complete in Obsidian alone, with the Interactive visible as a readable block
- [x] The author judges the Note good enough to learn from — the one criterion no script checks
- [x] Anything the Pack lacked for writing it is recorded against 15 rather than patched in place
- [x] Human sign-off was the only route to reviewed, and no agent set either field

## Comments

**Scope: all of Layer 0, not one Note.** One Floor Note cannot be drafted on its own with `check` passing. A Layer opens when any of its Notes is written, and then its eight remaining stubs make "stubs in an opened Layer" red. The metric's own action is to land the Layer together, so the author chose to run all nine Floor Notes through the pipeline.

**What ran, in order:**
1. **Packs.** `generate --layer 0`; `check` passes, and the log records the dispatch.
2. **Drafting.** Nine Note Authors ran in parallel, one Pack each. Every diff touched only the five sections, `status` and `updated`, and no generated block changed.
3. **Interactives.** Nine Interactive Authors added six blocks and filed five gaps in `.scratch/archetype-gaps/issues/`.
   - Between drafting and this step, Archetype coverage is red at 9 of 9. Drafting and Interactives therefore land as one step: `check` passes at every commit point, but not between these two.
   - Afterwards coverage is yellow at 3 of 9: *Factors and multiples*, *Inputs, outputs, and composition* and *Inverse operations* await their gaps.
4. **Correctness Review** from generated Bundles. Review 1 passed 2 of 9 and blocked 7. The author directed hand edits under `wiki/CLAUDE.md`: prose only, plus *Division restrictions*' stepper block, which is authored content, not generated. After each edit the Bundle was regenerated and a fresh reviewer ran. All nine reached `reviewed_by: agent` within three reviews. Reviews 2 and 3 also caught errors that the hand edits introduced or that Review 1 missed.
5. **Generate.** Run after each stage. The log shows stub → drafted for all nine, then each move to `reviewed by agent`.

**Findings worth keeping:**
- **No revise step in the pipeline.** No contract covers revising a Note after a blocking review. The Note Author works only on stubs, so here the revision was a hand edit. Each fix needs a fresh review, and that loop is the place to formalise.
- ***Division restrictions* was rewritten.** Review 1 found it solved equations, which only *Equations and rearranging formulas* teaches. It now finds an excluded value by working back from 0 with inverse operations, a Floor sibling's idea. The Anchor Graph is unchanged.
- **An open query for the author.** Every Layer 0 Note substitutes numbers for letters, and *Variables, substitution, and brackets* sits above the Floor. If that Node teaches substitution, the Anchor Graph has a fault. *Division restrictions* and *Inputs, outputs* carry this query.
- **The Pack's shortfalls are in 15's comments.**
- **Catalogue ambiguity.** It does not say whether `grid-plotter`'s `join` draws straight segments or a smooth curve. *Coordinates, tables, and plotting* left `join` off for that reason.

**Left for the author:** sign-off (`status: reviewed`, `reviewed_by: human`) on each Note judged good enough to learn from, the nine Floor plausibility verdicts, and triage of the five Archetype gaps. No agent set either sign-off field.

**Closed 2026-10-03.** The author read all nine Floor Notes in Obsidian, judged each good enough to learn from, recorded nine `plausible` verdicts in `observability/Floor Plausibility.md`, and set `status: reviewed` and `reviewed_by: human` on each by hand. No agent wrote either field or any verdict. `generate` logged the nine transitions from `drafted, reviewed by agent` to `reviewed, reviewed by human`; `check` passes with 12 of 12 invariants and no red metric. The dashboard reports 9 Notes signed off by a human and 0 awaiting sign-off.

Two hand-edit slips were repaired with the author's approval before check went green: in eight Notes the sign-off edit had replaced `requires: []` and left the stale `reviewed_by: agent` line, and the plausibility table had a blank line after its header that hid every row. A session fixed `requires` and the stale line only; the log carries one spurious reviewed → drafted → reviewed round-trip for *Decimals, ordering, and number lines* from an editor revert during that repair.

The one remaining yellow is two Notes with no Cross-references, *Multiplication, division, squares, and roots* and *Coordinates, tables, and plotting*, to be linked when next edited. The open Anchor Graph query about *Variables, substitution, and brackets* is still the author's to settle.
