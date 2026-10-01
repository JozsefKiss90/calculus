# 08: Archetype catalogue and parameter schemas

**What to build:** The thirteen Archetypes written down as reviewable parameter schemas, shipped first so the author can react before anything validates against them. For each Archetype in the spec's catalogue: its name, the one-liner that goes into a Context Pack, what it serves, and its full parameter schema — every parameter, its type, whether it is required, its default, its allowed range. No library name, no JavaScript expression, no component code (ADR-0004).

This is a design deliverable, not an implementation. It ships ahead of 09 and 10 precisely because if the catalogue is wrong, the validator and both agent contracts are built on sand. Archetype component implementations are app-side and out of scope.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] All thirteen Archetypes have a complete parameter schema; none is a placeholder
- [ ] Each schema is declarative and names no rendering library, framework or expression language
- [ ] Each Archetype carries a one-liner short enough to go into a Context Pack unmodified
- [ ] At least one worked example instance per Archetype, drawn from a Node in the Anchor Graph that actually needs it
- [ ] The catalogue records that it is a closed set, extended only through the Archetype Builder
- [ ] The author has reviewed and reacted to the catalogue before 09 starts
