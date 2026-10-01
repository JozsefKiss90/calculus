# 11: Graded metrics and the red gate

**What to build:** The five computed graded metrics, each with its green / yellow / red thresholds and its mandated action per level, written into the machine-readable report and gating the build: broken wikilinks; Notes with zero Cross-references; stale `updated` dates on non-reviewed Notes; Notes still at `stub` after their Layer is opened; and Archetype coverage, meaning Notes with no Interactive. Cross-references are counted, never Edges — the reference wiki's inbound and outbound link floor is impossible for a prerequisite DAG, since Floor Nodes have out-degree zero and the Terminal Node has in-degree zero by definition.

A red metric exits non-zero, which the gate wired in 03 already enforces. Floor plausibility is the sixth row of that table and is deliberately not here: it is a recorded review judgement rather than a computation, and 12 handles it.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Each of the five metrics has fixtures at its green, yellow and red boundaries, asserting both the level in the report and the exit code
- [ ] A red metric exits non-zero; a yellow metric exits zero and is visible in both the report and the human summary
- [ ] The report states the mandated action for the level each metric is at
- [ ] Cross-references and Edges are counted separately, and an Edge never counts as a Cross-reference
- [ ] "After their Layer is opened" is derived from computed Layer, not from a declared field
- [ ] Archetype coverage counts Notes with no interactive block without validating the blocks, so it does not depend on 09
