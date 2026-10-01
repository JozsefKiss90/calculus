# 12: Floor plausibility judgement

**What to build:** The one row of the thresholds table that is not a computation. A Node with no prerequisites whose content is clearly above 8th grade is an unfinished expansion masquerading as a Floor Node — the most likely silent failure in layered population, and nothing a script can see. This ticket builds the recording mechanism, not the judgement: `check` lists every Floor Node for judgement so the set is computed rather than maintained, a human records the verdict where the report can read it, and the recorded count of flagged Notes grades 0 / 1 / 2+ like every other row. Unjudged Floor Notes are reported as unjudged and never counted as plausible.

**Blocked by:** 11

**Status:** ready-for-agent

- [ ] `check` lists every Note with no prerequisites, so the judgement set is derived from the graph
- [ ] A recorded judgement per Floor Note — plausible, or flagged with a reason — lives in a single file outside the Notes
- [ ] The report grades the flagged count 0 / 1 / 2+ and a red count exits non-zero
- [ ] A Floor Note with no recorded judgement is reported as unjudged and does not count as plausible
- [ ] A judgement whose Note no longer has an empty `requires` is reported as stale
- [ ] Nothing here infers or computes the judgement; it only collects, records and grades it
