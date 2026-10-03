---
kind: observability
domain: observability
requires: []
status: drafted
reviewed_by: none
created: 2026-10-03
updated: 2026-10-03
---
# Graph Health Dashboard

## In one sentence

The Wiki's health as `npm run check` computes it, written here by `npm run generate` so this page and the build gate cannot disagree.

> [!info] Generated
> Every number on this page is copied from the computation `npm run check` gates on, which writes the same numbers to `.wiki-health/report.json` beside the vault. `npm run generate` rewrites this page, so a hand edit is lost on the next run.

## Verdict

**check passes**: 12 of 12 invariants hold; metrics 6 green, 0 yellow, 0 red.

## The Module at a glance

| Layer | Notes | Stub | Drafted | Reviewed |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 9 | 9 | 0 | 0 |
| 1 | 11 | 11 | 0 | 0 |
| 2 | 10 | 10 | 0 | 0 |
| 3 | 9 | 9 | 0 | 0 |
| 4 | 7 | 7 | 0 | 0 |
| 5 | 4 | 4 | 0 | 0 |
| 6 | 3 | 3 | 0 | 0 |
| 7 | 2 | 2 | 0 | 0 |
| 8 | 2 | 2 | 0 | 0 |
| 9 | 1 | 1 | 0 | 0 |
| 10 | 1 | 1 | 0 | 0 |
| 11 | 1 | 1 | 0 | 0 |
| 12 | 1 | 1 | 0 | 0 |
| **All** | **61** | **61** | **0** | **0** |

0 Notes are reviewed by an agent and wait for human sign-off. 0 Notes are signed off by a human.

## The graph

61 Nodes, 97 Edges and 9 Floor Nodes in the Anchor Graph; 61 of 61 Nodes reachable from the declared Terminal Node, Derivative. 65 Notes with frontmatter, 61 of them concept Notes.

## Invariants

| # | Invariant | Result | Failures |
|---:|---|---|---:|
| 1 | The Edge graph is acyclic | pass | 0 |
| 2 | Exactly one Node has in-degree zero, and it is the declared Terminal Node | pass | 0 |
| 3 | Every path from the Terminal Node terminates at a Node with no prerequisites | pass | 0 |
| 4 | No Node is unreachable from the Terminal Node | pass | 0 |
| 5 | Every requires entry resolves to an existing Note | pass | 0 |
| 6 | Every domain equals its containing directory | pass | 0 |
| 7 | No frontmatter key outside the schema; no enum value outside its closed set | pass | 0 |
| 8 | Every \$…\$ and \$\$…\$\$ block parses under KaTeX | pass | 0 |
| 9 | Every interactive block names a known Archetype and validates against its parameter schema | pass | 0 |
| 10 | Every Note at status drafted or above has a non-empty \#\# In one sentence | pass | 0 |
| 11 | The graph built from the Notes' requires is identical to the Anchor Graph | pass | 0 |
| 12 | Every raw file is tracked and unchanged, and every source Note's source\_file names one | pass | 0 |

## Metrics

| Metric | Level | Measure | Green | Yellow | Red |
|---|---|---|---|---|---|
| Broken wikilinks | green | 0 | 0 | 1–3 | 4+ |
| Notes with zero Cross-references | green | 0 of 0 written Notes (0%) | \<10% | 10–25% | \>25% |
| Stale updated (\>30d, non-reviewed) | green | 0 of 0 written Notes (0%) | \<10% | 10–20% | \>20% |
| Notes still stub after their Layer is opened | green | 0 | 0 | 1–3 | 4+ |
| Archetype coverage: Notes with no Interactive | green | 0 of 0 written Notes (0%) | \<20% | 20–40% | \>40% |
| Floor plausibility: Floor Notes flagged above 8th grade | green | 0 | 0 | 1 | 2+ |

### Floor plausibility: Floor Notes flagged above 8th grade: green

9 Floor Notes: 0 plausible, 0 flagged, 9 unjudged.

- [[Division restrictions]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Equivalent fractions and cancellation]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Factors and multiples]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Inverse operations]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Multiplication, division, squares, and roots]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Signed arithmetic and order of operations]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Coordinates, tables, and plotting]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Inputs, outputs, and composition]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md
- [[Decimals, ordering, and number lines]]: has no recorded judgement; record plausible or flagged in observability/Floor Plausibility.md

## Live view

Live, for authoring between runs: Dataview reads the frontmatter as it is now. The tables above are the authority, and are only as fresh as the last `npm run generate`.

```dataview
TABLE WITHOUT ID file.link AS Note, status, reviewed_by, updated
FROM ""
WHERE kind = "concept" AND status != "reviewed"
SORT status DESC, updated ASC
```
