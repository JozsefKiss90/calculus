# 17: Index, dashboard and generated log

**What to build:** The three human-facing views, all generated from the same computation that gates the build. `generate` regenerates `wiki/index.md` as the entry point to the Wiki; `wiki/observability/Graph Health Dashboard.md` as the Dataview mirror of the machine-readable report, so the human view and the machine view cannot disagree (ADR-0002); and `wiki/log.md` as the record of what the pipeline did — which Layer ran when, how many Notes moved state, and what the health report said at the time.

The log is generated, not hand-written. The reference wiki's log was hand-maintained and its per-session metrics blocks were wrong about their own counts, which is the same drift lesson as everything else here. For a layered pipeline the log is the only way to reconstruct six weeks later what actually happened.

**Blocked by:** 06, 11

**Status:** ready-for-agent

- [ ] `generate` writes all three, and a second run on an unchanged vault produces an empty diff
- [ ] Every number on the dashboard comes from the same computation `check` gates on; a test changes a vault and asserts the report and the dashboard agree
- [ ] The dashboard shows the stub / drafted / reviewed breakdown across the Module at a glance
- [ ] `wiki/log.md` gains an entry per pipeline run recording the date, the Layer, the state transitions and the report's metric levels
- [ ] No count in any of the three files is hand-maintained
- [ ] `index.md`, `log.md` and `CLAUDE.md` carry no frontmatter and are excluded from every graph computation by that absence
