# 02: CLI skeleton and the structural graph gate

**What to build:** `check` exists, and the structural invariants gate the repo before any Note does. One Node CLI entry point in `scripts/`, taking a vault directory as an argument so it is testable against fixtures, with a `check` subcommand that loads the Anchor Graph from its Mermaid block, honours the edge direction, and enforces invariants 1 to 4: the Edge graph is acyclic; exactly one Node has in-degree zero and it is the declared Terminal Node; every path from the Terminal Node terminates at a Node with no prerequisites; no Node is unreachable. It writes the machine-readable report, prints a human summary, and exits non-zero on any failure.

This ticket also establishes the test convention everything later follows: a fixture vault in a temporary directory, the CLI driven from outside, assertions on files written, report contents and exit code, nothing mocked.

**Blocked by:** 01

**Status:** done

- [x] `check` against the real vault reports 61 Nodes, 97 Edges, acyclic, a single root at Derivative, 61 of 61 reachable, 9 Floor Nodes, and exits 0
- [x] The machine-readable report is written to a fixed path and is readable from a terminal without opening Obsidian
- [x] Each of invariants 1 to 4 has a fixture that violates it and one that satisfies it; the violating run exits non-zero and the report names that specific invariant
- [x] The graph loader produces one in-memory representation, shaped so the Notes' frontmatter can be added as a second front-end later without a second graph builder
- [x] No test asserts on an internal function's return value

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

---

From 02, which built the CLI the next three tickets extend. Six decisions the ticket
forced and the spec did not settle, recorded here rather than buried in the code.

**The report is `.wiki-health/report.json` beside the vault, not inside it.** ADR-0002
separates the machine report from the Dataview mirror, and the vault holds learning
content only, so the report cannot live in `wiki/`. Its path is derived from the vault
argument — the directory holding the vault, plus `.wiki-health/report.json` — which
keeps it a fixed path from the repo root (`cat .wiki-health/report.json`) while a
fixture run writes into its own temporary directory rather than clobbering the repo's.
It is gitignored: regenerated on every run, so tracking it would dirty the tree on each
check and fight the pre-commit hook 03 adds.

**The Terminal Node is declared as a constant in `scripts/wiki.js`.** There is nowhere
better for it. Frontmatter is out — invariant 7 fails any key outside the schema, so a
`terminal_node` key on the Anchor Graph Note would break the Note it describes. Prose is
out — the declaration has to be machine-readable, and a sentence in a frozen Note is not.
So `TERMINAL_NODE = "Derivative"` in the CLI is the declaration, and invariant 2 holds the
graph against it.

A `--terminal` flag was built first, to let a second Module anchor elsewhere, and review
removed it. Module 2 is out of scope by the spec, no fixture needed it — every other
fixture names its Terminal Node *Derivative* and the absent-Terminal-Node fixture wants the
declaration left alone — and the flag carried a real bug: `--terminal` with no value fell
back to the default and silently checked Module 1's declaration against another Module's
graph. A declaration that can be overridden at the call site is a declaration that can be
wrong at the call site. `check` now takes no options at all, and an argument beginning with
`-` is named rather than read as a vault directory.

**The Anchor Graph Note is found by its name ending `Anchor Graph.md` at the vault root.**
Not hardcoded to `Module 1`, and not configured. Two such files is an error naming both,
which is exactly where Module 2 will need a `--module` selector — a loud failure at the
moment the assumption breaks, rather than silently checking whichever sorted first.

**Invariant 3 cannot be violated on its own, and invariant 4 usually cannot either.** In
a finite acyclic graph every path must end at a Node with no prerequisites, so the only
way a path can fail to reach the Floor is to circle forever: invariant 3's violating
fixture necessarily violates invariant 1 too. Similarly an unreachable Node normally
implies a second root, which is invariant 2 — unless the unreachable part is itself a
cycle, which is what invariant 4's fixture uses, so that one does fail alone. Both are
still computed and named separately, because "these Nodes never reach the Floor" and
"these Nodes are unreachable" tell a reader which part of the Module is broken, which a
list of cycles does not.

**A graph that cannot be read is a loud failure, never a smaller graph.** An unrecognised
line, an arrow type outside the accepted dialect, one id carrying two different names, two
ids carrying the same name, and the same Edge declared twice all stop the run and name the
offending line. A loader that skips or quietly merges what it does not understand reports a
graph nobody reviewed and then passes it. Exit codes split accordingly: 0 everything holds,
1 the check ran and an invariant failed, 2 the check could not run at all. A run that exits
2 still leaves a `status: "error"` report behind, so the pipeline reads one answer whatever
went wrong.

The duplicate Edge was first deduplicated and reported as a count, and review caught the
asymmetry: the run exited 0 while reporting 96 Edges where 97 lines declared them, which is
the one thing the rest of the loader refuses to do. Erroring needs no new concept and no new
report field — a frozen graph declares each Edge once, and a repeated line is a typo in an
artefact a human signed off.

**No dependencies, and no typechecker.** Tests are `node:test` driven through `npm test`,
so 03's CI needs no install step and the hook runs the same command a human runs. There is
no TypeScript in the repo and the spec chose plain Node; adding a toolchain is a decision
for a ticket that needs it, not a side effect of this one. One wrinkle worth knowing:
`node --test tests` fails to resolve the directory on this Node and platform, so the script
is `node --test "tests/**/*.test.js"`.

Two notes for 04 and 05, which extend what is here. `scripts/lib/graph.js` holds the one
in-memory representation: a front-end produces Node and Edge declarations with provenance,
`buildGraph` turns declarations into the graph, and the structural invariants read only the
graph. The Notes' frontmatter becomes a second front-end producing the same declarations —
Note name as the Node name, file path as the provenance, Nodes selected on `kind: concept`
per 01's note above — and 05's invariant 11 compares two graphs built by that same function.
Nothing in the Mermaid parser is reachable from the Notes' side. Nothing in 02 reads
frontmatter at all, so the `kind: concept` rule is 05's to implement and 05's to test.

The report states the declared Terminal Node and, separately, every Node nothing requires,
so a reader of `report.json` sees the computed answer rather than inferring it from invariant
2's verdict.

The test convention this ticket establishes is in `tests/helpers/vault.js`: build a fixture
vault in a temporary directory, spawn the CLI against it as a real child process, assert on
exit code, stdout and the report file. No test imports anything under `scripts/lib/`, which
is what keeps the implementation free to change. One test is deliberately outside that
convention: the real-vault regression test runs against `wiki/` itself, because the frozen
graph is the thing under test, and it writes the repo's own `.wiki-health/report.json` as any
run against that vault would.
