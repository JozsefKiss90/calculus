# 12: Floor plausibility judgement

**What to build:** The one row of the thresholds table that is not a computation. A Node with no prerequisites whose content is clearly above 8th grade is an unfinished expansion masquerading as a Floor Node — the most likely silent failure in layered population, and nothing a script can see. This ticket builds the recording mechanism, not the judgement: `check` lists every Floor Node for judgement so the set is computed rather than maintained, a human records the verdict where the report can read it, and the recorded count of flagged Notes grades 0 / 1 / 2+ like every other row. Unjudged Floor Notes are reported as unjudged and never counted as plausible.

**Blocked by:** 11

**Status:** done

- [x] `check` lists every Note with no prerequisites, so the judgement set is derived from the graph
- [x] A recorded judgement per Floor Note — plausible, or flagged with a reason — lives in a single file outside the Notes
- [x] The report grades the flagged count 0 / 1 / 2+ and a red count exits non-zero
- [x] A Floor Note with no recorded judgement is reported as unjudged and does not count as plausible
- [x] A judgement whose Note no longer has an empty `requires` is reported as stale
- [x] Nothing here infers or computes the judgement; it only collects, records and grades it

## Comments

From 12, which implemented it. `check` now grades a sixth metric, `floor-plausibility`,
after the five computed ones, with the same shape (`level`, `bands`, `action`, `actions`,
`notes`). Every criterion has a test in `tests/check-floor-plausibility.test.js`. The real
vault is green, with all 9 Floor Notes listed as unjudged.

**The judgements live in `wiki/observability/Floor Plausibility.md`**, as a
`Note | Verdict | Reason` table. The file has no frontmatter, so it is not a Note: its
wikilinks are not graded as broken links, and the Notes are never touched by a judgement.
It sits in the vault so the author can judge in Obsidian and click through to each Note,
and so Obsidian rewrites its wikilinks when a Note is renamed. It ships with an empty table
and a short explanation of the format. A missing file means no judgements at all.

**A Floor Note is a concept Note whose `requires` is literally empty**, read from the
Notes and not from the Anchor Graph or the computed Layers. So the metric needs no graph and
is never `skipped`.

**Only `flagged` verdicts are graded.** Unjudged Floor Notes do not move the level. They are
listed in `unjudged`, and the human summary prints them at every level, green included,
because they are the work queue. They are also counted in `judged`, as
`{floorNotes, plausible, flagged, unjudged}`, and `floorNotes` gives every Floor Note's
verdict. **Open for the author:** a vault with every Floor Note unjudged grades green. If
unjudged should count against the build, for example once a Floor Note is `drafted`, that is
a threshold the spec does not set, so it is yours to choose.

**A stale judgement counts for nothing and is only reported.** That covers a Note that has
gained a prerequisite, a judged Note that never was a Floor Note, and a row naming no concept
Note. Each one is listed in `stale` with its line number and printed in the summary. None of
them fails the build.

**A judgements file `check` cannot read in full is refused with exit 2**, the same way an
unreadable Archetype catalogue is. That covers no `Note | Verdict | Reason` table, a row with
the wrong number of cells, a Note that is not a single `[[wikilink]]`, a Verdict other than
`plausible` or `flagged`, a `flagged` row with no Reason, and a Note judged twice. A misread
verdict would grade a Note on something nobody wrote.

**The mandated actions are this ticket's wording.** Yellow and red both say to *propose* the
missing prerequisites as an Anchor Graph change, because agents never change the Anchor
Graph themselves. They can also re-judge a flag that was wrong.

`tests/check-metrics.test.js` now expects six metrics and one more green in the closing line.
The CRLF failure in `tests/precommit-and-ci-gate.test.js` noted under 11 is still the only
failing test.

Note for 17: the dashboard can read `floorNotes` and `judged` directly from the metric.

**Closed 2026-10-03.** Every criterion was met and ticket 18 ran the full Layer 0 pipeline on this implementation unchanged; the author signed off all nine Floor Notes and closed 18. The judgements recorded above stand as made unless the author reopens them.
