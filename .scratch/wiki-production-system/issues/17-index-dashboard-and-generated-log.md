# 17: Index, dashboard and generated log

**What to build:** The three human-facing views, all generated from the same computation that gates the build. `generate` regenerates `wiki/index.md` as the entry point to the Wiki; `wiki/observability/Graph Health Dashboard.md` as the Dataview mirror of the machine-readable report, so the human view and the machine view cannot disagree (ADR-0002); and `wiki/log.md` as the record of what the pipeline did — which Layer ran when, how many Notes moved state, and what the health report said at the time.

The log is generated, not hand-written. The reference wiki's log was hand-maintained and its per-session metrics blocks were wrong about their own counts, which is the same drift lesson as everything else here. For a layered pipeline the log is the only way to reconstruct six weeks later what actually happened.

**Blocked by:** 06, 11

**Status:** done

- [x] `generate` writes all three, and a second run on an unchanged vault produces an empty diff
- [x] Every number on the dashboard comes from the same computation `check` gates on; a test changes a vault and asserts the report and the dashboard agree
- [x] The dashboard shows the stub / drafted / reviewed breakdown across the Module at a glance
- [x] `wiki/log.md` gains an entry per pipeline run recording the date, the Layer, the state transitions and the report's metric levels
- [x] No count in any of the three files is hand-maintained
- [x] `index.md`, `log.md` and `CLAUDE.md` carry no frontmatter and are excluded from every graph computation by that absence

## Comments

From 17, which implemented it. `check`'s computation moved to `scripts/lib/health.js` (`assessHealth`), and `generate` calls the same function after writing the blocks, Packs and Bundle. It then renders `index.md` (`wiki-index.js`), the dashboard (`dashboard.js`) and the log (`log.js`) from that one report object (`views.js`). The report gains a `progress` field: concept Notes by status and by `reviewed_by`, across the Module and per Layer. That is where the dashboard's breakdown comes from, so `check` writes it too.

The dashboard is a `kind: observability` Note, so it is held to every invariant. Its body is escaped text plus links to Notes that exist, and the report is computed with the dashboard read as its fixed shell. So it never adds a broken link or a maths expression to the numbers it mirrors, even on a first run or after a Note it listed is deleted. Its `updated` moves only when its content does.

The log appends an entry only when a Note's `status` or `reviewed_by` moved, a metric's level or the verdict changed, or `--layer` dispatched a Layer. This is how "an entry per pipeline run" squares with "a second run produces an empty diff". It finds what moved by comparing the vault with the state the last entry recorded, kept as JSON in an HTML comment at the log's foot. Two `--layer` runs in a row log two entries, since each dispatches the Layer again.

`tests/index-dashboard-log.test.js` covers all of it through the CLI. The real vault's three files are committed as `generate` wrote them.

**Closed 2026-10-03.** Every criterion was met and ticket 18 ran the full Layer 0 pipeline on this implementation unchanged; the author signed off all nine Floor Notes and closed 18. The judgements recorded above stand as made unless the author reopens them.
