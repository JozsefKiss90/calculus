# 09: Interactive block validation

**What to build:** Invariant 9 — every interactive block names a known Archetype and validates against its parameter schema. A fenced block with language `interactive` containing YAML; an unknown archetype name, a missing required parameter, an unknown parameter, a wrong type or an out-of-range value each fail the build, so a typo cannot reach a learner as a blank box. Mechanical work against the catalogue reviewed in 08.

The degradation requirement needs no work here: Obsidian renders the block as plain text, so a learner reading the Wiki directly sees a readable specification rather than a broken embed.

**Blocked by:** 05, 08

**Status:** ready-for-agent

- [ ] A block naming an Archetype outside the catalogue fails with a non-zero exit and a report naming the Note and the unknown name
- [ ] A missing required parameter, an unknown parameter, a wrong type and an out-of-range value each fail, and are each named distinctly in the report
- [ ] A valid instance of each of the thirteen Archetypes passes
- [ ] Malformed YAML inside the block is a validation failure with a useful message, not a crash
- [ ] A Note containing a valid block is readable in Obsidian with the block visible as text
