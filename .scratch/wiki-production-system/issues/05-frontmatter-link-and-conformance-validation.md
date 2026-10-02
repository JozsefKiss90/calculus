# 05: Frontmatter, link and conformance validation

**What to build:** `check` now validates the Notes, not only the Anchor Graph. Invariants 5 to 7 and 10, computed from the Notes: every prerequisite entry resolves to an existing Note; every `domain` equals its containing directory; no frontmatter key outside the schema and no enum value outside its closed set; every Note at `drafted` or above has a non-empty one-sentence summary.

And invariant 11, which joins the two graph sources: the graph built from the Notes' prerequisites is identical to the Anchor Graph. This is what makes "agents never change the structure" enforceable rather than conventional, so its failure message must name **both** directions of the mismatch — what is in the Anchor Graph but not the Notes, and what is in the Notes but not the Anchor Graph. Adding a Node legitimately produces a one-sided mismatch until both sides are updated, and a one-directional message would read as a bug.

**Blocked by:** 04

**Status:** ready-for-human

- [x] The Notes' frontmatter feeds the same graph loader as the Anchor Graph; there is still exactly one graph builder
- [x] Each of invariants 5, 6, 7, 10 and 11 has a violating and a satisfying fixture; the violating run exits non-zero and the report names the invariant and the offending Note
- [x] A prerequisite pointing at a deleted Note, a `domain` that no longer matches its directory, an undeclared key, and an out-of-enum value are each caught and each named distinctly
- [x] Invariant 11's failure message lists both directions of the mismatch separately
- [x] A Node added to the Anchor Graph but not yet scaffolded reads as a one-sided mismatch naming the missing Note, not as an unexplained failure
- [x] Structural files are excluded from every graph computation by their absence of frontmatter, not by a hardcoded name list
- [x] `check` on the freshly scaffolded vault exits 0

## Comments

From 01, which wrote the first frontmatter block in the vault. Two of this ticket's
criteria need adjusting before they can be implemented as written.

**"Excluded by their absence of frontmatter, not by a hardcoded name list" is no
longer sufficient.** It holds for `CLAUDE.md`, `index.md` and `log.md`, which carry no
frontmatter. It does not hold for `wiki/Module 1 Anchor Graph.md` or for source Notes
under `wiki/sources/`: both carry frontmatter and neither is a Node. The replacement is
still not a name list — select Nodes on `kind: concept`. The Anchor Graph Note is
`kind: reference` with `requires: []`, so without that filter it reads as an extra
Floor Node and invariant 4 fails on a clean vault.

**Invariant 6 is basename-of-parent, not a five-value enum.** The Anchor Graph Note
sits at the vault root and carries `domain: wiki`, which is not one of the five domains
the spec names. `domain` equals the basename of the file's containing directory, with
no special case: `wiki` at the root, `observability` for the dashboard, `sources` for a
source Note, and the five domain names for Nodes. Validating against the five-name list
instead would fail the vault's own Anchor Graph. The spec's "Repository and vault
topology" section names the five domains and does not spell this out; 01's Comments
carry the reasoning.

From 05, which implemented it. `check` now runs invariants 5, 6, 7, 10 and 11 after 1
to 4, and passes on the scaffolded vault: 62 Notes with frontmatter, 61 of them concept
Notes, all nine invariants holding. Status is `ready-for-human` only for review; every
criterion has a test in `tests/check-notes.test.js`.

Decisions the ticket forced and the spec did not settle:

**Both Comments above are applied.** Nodes are concept Notes (`kind: concept`), and
`domain` is checked against the basename of the containing directory, so the Anchor
Graph Note's `domain: wiki` holds because the vault directory is `wiki`.

**A Note is named by its filename, and the Anchor Graph's names are spelled the same
way before comparing.** `noteNameFor` moved out of `scaffold.js` into
`scripts/lib/note-names.js` so invariant 11 and `scaffold` share it. That is how the two
"over" Notes meet their Nodes. Reports name Nodes in that spelling.

**Wikilinks resolve the way Obsidian resolves them**: by Note name, ignoring case, a
folder path, `#heading` and `|display`. Every Note with frontmatter is a link target,
so invariant 5 can say *why* a link fails: no Note by that name, more than one, a target
that is not a concept, or an entry that is not a `[[wikilink]]`. A non-concept Note with
a non-empty `requires` also fails 5.

**An unresolved `requires` entry is not an Edge.** Otherwise a deleted Note would be
recreated as a Node by the links still pointing at it, and invariant 11 would miss it.
A deleted Note fails both 5 (the link) and 11 (the missing Node).

**Invariant 11 is skipped, not passed, while the vault has no concept Notes.** The spec
has invariants 1 to 4 gate from the first commit, before any Note exists, and every
anchor-only fixture relies on that. A skipped invariant does not fail the build; the
summary says `N of N invariants hold, 1 not checked`. The cost is that deleting every
concept Note at once passes `check`; `tests/check-real-vault.test.js` still catches it, because it pins 61 concept Notes.

**Invariant 11 always reports both directions when it fails**, each its own failure with
`nodes` and `edges`. The side with no difference says `nothing`, so a one-sided
mismatch reads as one-sided. A Node not yet scaffolded reads `Node "X" has no Note;
scaffold creates it`.

**Invariant 7 covers more than undeclared keys and enum values**: a missing required
key, a list where a value belongs or the reverse, a repeated prerequisite, and
frontmatter outside the flat subset (nested mappings, block scalars, unclosed blocks).
Each failure carries a `problem` slug (`undeclared-key`, `out-of-enum-value`,
`missing-key`, …) beside the Note's path, so the cases are named distinctly in the
report. `source_file`, `source_type` and `date_ingested` are allowed on `kind:
source` only; requiring and validating them is 14's.

**The frontmatter reader is hand-written**, about 150 lines, because the schema is flat
keys and arrays of scalars and the repo has no dependencies. What it cannot read is a
failure naming the line, never skipped.

**Invariant 10 checks present and non-empty, not "one sentence".** Counting sentences
in prose with abbreviations and mathematics is a heuristic; that cap fits 13's house
style better. HTML comments do not count as content.

Notes for later tickets:

- **The report gained `notes: {notes, conceptNotes}`**, and `summary.invariantsChecked`
  now excludes skipped invariants.
- **`.wiki-health/report.json` is no longer tracked.** Its `.gitignore` line had been
  commented out, so every `check` dirtied the tree; this commit restores it.
- **06 can read prerequisites through `buildNotesGraph` in `scripts/lib/notes.js`**,
  which returns the same graph object the Anchor Graph does.
