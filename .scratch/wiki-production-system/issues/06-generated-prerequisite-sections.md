# 06: Generated prerequisite sections and mini-map

**What to build:** The reverse direction of every Edge appears in the Wiki without any agent writing one. `generate` rewrites three machine-owned blocks in every Note between stable markers: the Builds on section, listing each direct prerequisite as a wikilink with its one-sentence summary; the Required by section, listing each requiring Node with its one-liner; and the local prerequisite mini-map, a flowchart of the Node, its direct prerequisites and its direct dependents. Rewritten idempotently on every run, leaving authored prose untouched.

This is also the half of "add a Node later and tell me what that breaks" that 05 cannot give: 05 enforces, `generate` explains. Re-running it after a graph change produces a reviewable diff showing every shifted Layer and every changed section.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] `generate` fills both generated sections correctly for every Note, including the Floor Nodes (nothing to build on) and the Terminal Node (nothing requires it)
- [ ] A second run produces an empty diff
- [ ] Authored prose outside the markers is byte-identical before and after
- [ ] The mini-map renders in Obsidian and honours the Anchor Graph's edge direction
- [ ] Adding a Node, scaffolding it, and re-running `generate` produces a diff confined to the Notes the change actually affects
- [ ] `generate` never writes a prerequisite entry; the reverse direction exists only inside the generated blocks
- [ ] A hand-edited generated block is overwritten on the next run, and that is documented rather than defended against
