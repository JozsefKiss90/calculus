# Graph health is computed by a script; the Dataview dashboard mirrors it

An in-repo script is the authority on graph health — orphans, link degree, density, broken links, schema violations, prerequisite cycles, Floor reachability. It emits a machine-readable report that agents read and gate on, plus a generated `wiki/observability/Graph Health Dashboard.md`. Dataview is installed and the dashboard carries live queries too, but for human eyes while authoring only.

## Considered Options

**Dataview alone**, as in the reference wiki at `C:\Code\el_nino\wiki`: 15 DQL blocks in a single hand-written dashboard note, no scripts.

**Script-authoritative with a Dataview mirror** (chosen).

## Consequences

The reason is that a Dataview query is inert text to an agent. The reference wiki's maintenance schema instructs agents to "add frontmatter to the listed pages" — but that list materialises only when a human opens Obsidian and the plugin renders it. No agent can ever see it. The observable result in that wiki is drift that was detected by design and repaired by nobody: 20 declared domains against 17 real ones, a four-value `status` enum with all pages on one value, and hand-maintained statistics that were wrong about their own file count.

For an agent fleet, observability that only a human can read is not observability. So the script is what the pipeline gates on, and it must be runnable outside Obsidian entirely.

The cost is two implementations of the same metrics, which can disagree. The mirror is generated from the script's output rather than maintained by hand, so disagreement shows up as a diff rather than as silent drift.
