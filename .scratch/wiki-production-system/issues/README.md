# Wiki Production System — tickets

Spec: [../spec.md](../spec.md). Numbered in dependency order, blockers first. Work the frontier: any ticket whose blockers are all done.

## Blocking edges

| Ticket | Blocked by |
|---|---|
| 01 Vault topology and the frozen Anchor Graph | — |
| 02 CLI skeleton and the structural graph gate | 01 |
| 03 Pre-commit hook and CI gate | 02 |
| 04 Scaffold the 61 stub Notes | 02 |
| 05 Frontmatter, link and conformance validation | 04 |
| 06 Generated prerequisite sections and mini-map | 05 |
| 07 KaTeX subset validation and the notation authority | 05 |
| 08 Archetype catalogue and parameter schemas | 01 |
| 09 Interactive block validation | 05, 08 |
| 10 Interactive Author and Archetype Builder agent contracts | 08, 09 |
| 11 Graded metrics and the red gate | 05 |
| 12 Floor plausibility judgement | 11 |
| 13 House style and the vault's CLAUDE.md | 01 |
| 14 Source Notes and the immutable raw store | 05, 07 |
| 15 Context Packs for a Layer | 06, 07, 08, 13 |
| 16 Correctness Reviewer bundle and the agent-reviewed gate | 06, 14 |
| 17 Index, dashboard and generated log | 06, 11 |
| 18 One Floor Note end to end | 10, 12, 15, 16, 17 |

08 and 13 are blocked only by 01 and need no code, so they run in parallel with the entire code stream.

## Manual checkpoint after 04 — deliberately not a ticket

Once `scaffold` lands, walk one Floor Note through the pipeline entirely by hand: play each agent yourself, with no scripts, no Pack generator, nothing but the skeleton and the style rules. It costs about an hour and tests the part no script can — whether a Context Pack's contents are enough to write a good Note.

If they are not, that is worth learning before 06 through 17 are built around the assumption. It sits outside the ticket graph because it is de-risking rather than delivery; 18 is where the same question gets its formal answer.
