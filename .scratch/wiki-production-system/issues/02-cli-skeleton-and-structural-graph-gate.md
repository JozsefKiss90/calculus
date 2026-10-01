# 02: CLI skeleton and the structural graph gate

**What to build:** `check` exists, and the structural invariants gate the repo before any Note does. One Node CLI entry point in `scripts/`, taking a vault directory as an argument so it is testable against fixtures, with a `check` subcommand that loads the Anchor Graph from its Mermaid block, honours the edge direction, and enforces invariants 1 to 4: the Edge graph is acyclic; exactly one Node has in-degree zero and it is the declared Terminal Node; every path from the Terminal Node terminates at a Node with no prerequisites; no Node is unreachable. It writes the machine-readable report, prints a human summary, and exits non-zero on any failure.

This ticket also establishes the test convention everything later follows: a fixture vault in a temporary directory, the CLI driven from outside, assertions on files written, report contents and exit code, nothing mocked.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `check` against the real vault reports 61 Nodes, 97 Edges, acyclic, a single root at Derivative, 61 of 61 reachable, 9 Floor Nodes, and exits 0
- [ ] The machine-readable report is written to a fixed path and is readable from a terminal without opening Obsidian
- [ ] Each of invariants 1 to 4 has a fixture that violates it and one that satisfies it; the violating run exits non-zero and the report names that specific invariant
- [ ] The graph loader produces one in-memory representation, shaped so the Notes' frontmatter can be added as a second front-end later without a second graph builder
- [ ] No test asserts on an internal function's return value

## Comments

From 01, which created the file this ticket's loader reads:

The Anchor Graph now lives at `wiki/Module 1 Anchor Graph.md`, and the graph is the
fenced `mermaid` block inside it — not a bare `.mmd` file. The block is byte-identical
to the old `example_nodes.mmd`, so a parser written against that file still applies
once the fence is stripped. Node ids are the short uppercase keys (`D`, `AE`, `SINL`);
the human name is the bracketed label, declared at a Node's first appearance and
omitted on later mentions, so the loader has to accumulate labels rather than expect
one per line. `subgraph` lines are grouping, not Nodes, and one Edge carries a
`-->|"label"|` pill that is commentary and must not be parsed as part of the id.

**Select Nodes on `kind: concept`.** The Anchor Graph Note itself carries frontmatter
with `requires: []` (the schema requires both keys), so a loader that treats "has
frontmatter" as "is a Node" will read it as a tenth Floor Node, break invariant 4, and
miss this ticket's `9 Floor Nodes` assertion. See 01's Comments and 05's.

Parsing the committed block gives exactly this ticket's first checkbox: 61 Nodes, 97
Edges with no duplicates, acyclic, a single in-degree-zero root at *Derivative*, 61 of
61 reachable, 9 Floor Nodes. Those numbers are a regression target, not something to
write into the vault — 01 removed them from the Note's prose for that reason.
