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
