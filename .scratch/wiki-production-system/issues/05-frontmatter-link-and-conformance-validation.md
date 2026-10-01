# 05: Frontmatter, link and conformance validation

**What to build:** `check` now validates the Notes, not only the Anchor Graph. Invariants 5 to 7 and 10, computed from the Notes: every prerequisite entry resolves to an existing Note; every `domain` equals its containing directory; no frontmatter key outside the schema and no enum value outside its closed set; every Note at `drafted` or above has a non-empty one-sentence summary.

And invariant 11, which joins the two graph sources: the graph built from the Notes' prerequisites is identical to the Anchor Graph. This is what makes "agents never change the structure" enforceable rather than conventional, so its failure message must name **both** directions of the mismatch — what is in the Anchor Graph but not the Notes, and what is in the Notes but not the Anchor Graph. Adding a Node legitimately produces a one-sided mismatch until both sides are updated, and a one-directional message would read as a bug.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] The Notes' frontmatter feeds the same graph loader as the Anchor Graph; there is still exactly one graph builder
- [ ] Each of invariants 5, 6, 7, 10 and 11 has a violating and a satisfying fixture; the violating run exits non-zero and the report names the invariant and the offending Note
- [ ] A prerequisite pointing at a deleted Note, a `domain` that no longer matches its directory, an undeclared key, and an out-of-enum value are each caught and each named distinctly
- [ ] Invariant 11's failure message lists both directions of the mismatch separately
- [ ] A Node added to the Anchor Graph but not yet scaffolded reads as a one-sided mismatch naming the missing Note, not as an unexplained failure
- [ ] Structural files are excluded from every graph computation by their absence of frontmatter, not by a hardcoded name list
- [ ] `check` on the freshly scaffolded vault exits 0
