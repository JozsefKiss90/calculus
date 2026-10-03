# Spec: Wiki Production System

Status: ready-for-agent

Scope: the system that produces and validates the Wiki. Not the App.

Governing decisions: [ADR-0001](../../docs/adr/0001-target-anchored-prerequisite-closure.md), [ADR-0002](../../docs/adr/0002-script-authoritative-graph-health.md), [ADR-0003](../../docs/adr/0003-frontmatter-stores-only-what-the-graph-cannot-derive.md), [ADR-0004](../../docs/adr/0004-interactives-are-archetype-instances.md), [ADR-0005](../../docs/adr/0005-authors-read-a-context-pack-not-the-wiki.md), [ADR-0006](../../docs/adr/0006-latex-is-restricted-to-the-katex-subset.md). Vocabulary: [GLOSSARY.md](../../GLOSSARY.md).

## Problem Statement

I want to learn and teach mathematics from material that is genuinely good: interactive rather than static, honest about what it assumes, and navigable by how ideas actually depend on each other rather than by chapter order. I want to author that material as an Obsidian Wiki and teach from it in a browser.

Writing sixty-odd interlinked Notes by hand is more than I can do alone, so agents have to write most of it. That creates the real problem. An agent fleet writing mathematics at scale will produce content that is plausible, fluent, and sometimes wrong — and wrong mathematics taught confidently is worse than no material at all. It will also drift: terminology will fork, prerequisites will contradict each other, notation will be inconsistent between Notes written an hour apart, and nobody will notice until a learner is stuck on a page that quietly assumes something it never taught.

The reference wiki at `C:\Code\el_nino\wiki` shows the failure concretely. It has a careful 877-line maintenance schema and a 15-query health dashboard, and it still accumulated drift that was never repaired: 20 declared domains against 17 real directories, a four-value lifecycle enum whose pages all sat on one value, a hand-maintained statistics block wrong about its own file count. Its observability worked — but only a human opening Obsidian could read it, so the agents doing the work were blind to every signal meant to govern them.

## Solution

A production system in which the structure is decided and frozen before any content is written, every rule an agent must follow is either generated into its input or enforced by a script that fails the build, and no agent is ever asked to decide what should exist.

Three parts:

**A frozen Anchor Graph.** Module 1's 61 Nodes and 97 Edges are reviewed once by a human and then fixed. Agents may propose changes; they never make them. Every authoring task becomes "write this one named Note", never "work out what to write about".

**A thin schema and a thick script.** Frontmatter carries only what the graph cannot derive. Everything else — Layer, Floor status, hub status, reverse Edges, prerequisite diagrams, learning sequence — is computed. A CLI validates the graph's invariants, the frontmatter, the LaTeX, and the Archetype references, and gates the build on them. Its output is machine-readable so agents can act on it, and mirrored into a Dataview dashboard so humans can read it while authoring.

**Context Packs instead of exploration.** Notes are written bottom-up by Layer. Each authoring agent gets a generated Pack for exactly one Node and does not read the rest of the Wiki. Measured on the real graph, a Node has at most 4 direct prerequisites and a median of 2, so a Pack is one Node plus about two sentences of upstream context.

The Wiki is the single source of truth. The App is generated from it and holds no content of its own. Every Note is fully readable in Obsidian alone; Interactives degrade to a visible, readable block rather than breaking.

## User Stories

### As a learner

1. As a learner, I want every Note to tell me in one sentence what it is about, so that I can decide in five seconds whether I am in the right place.
2. As a learner, I want every Note to tell me why I need it, so that I am never learning something whose purpose is unexplained.
3. As a learner, I want to see exactly what a Note assumes I already know, so that I can go and get that first instead of struggling.
4. As a learner, I want to see what depends on the Note I am reading, so that I know where this is going.
5. As a learner who has forgotten 8th-grade material, I want the Floor Notes to actually teach it rather than point me elsewhere, so that I am not handed off to a stranger at the moment I am stuck.
6. As a learner, I want to follow a path from basic arithmetic all the way to the derivative without hitting a gap, so that nothing in the chain is missing.
7. As a learner, I want interactive graphs, sliders and animations rather than static pictures, so that I can see what changes when something changes.
8. As a learner, I want a section naming the mistakes people actually make, so that I can recognise my own.
9. As a learner, I want worked examples with concrete numbers before general forms, so that I have something to hold on to.
10. As a learner, I want notation to mean the same thing in every Note, so that I am not silently re-learning symbols.
11. As a learner, I want to be told when mathematics has competing conventions, so that I am not confused by another source using the other one.
12. As a learner, I want formulas to render correctly everywhere I read them, so that I never have to guess what a broken symbol was meant to be.
13. As a learner, I want the material to be correct, so that I am not learning something I will later have to unlearn.
14. As a learner reading in Obsidian rather than the App, I want the Note to still make sense, so that the source material stands on its own.

### As the author and owner

15. As the author, I want to approve the Node inventory before any content is written, so that no agent decides what the Module contains.
16. As the author, I want absences from the Wiki to be deliberate, so that a missing topic means "the derivative does not require it" rather than "we forgot".
17. As the author, I want to sign off every Note as correct before it counts as finished, so that no mathematics reaches a learner unreviewed by a human.
18. As the author, I want to see progress across the Module at a glance, so that I know how much of it is stub, drafted, and reviewed.
19. As the author, I want the health report to be a file I can read without opening Obsidian, so that I can check the Wiki from a terminal or in CI.
20. As the author, I want the build to fail on a structural problem rather than warn me, so that broken structure cannot accumulate.
21. As the author, I want to add a Node later and have the system tell me what that breaks, so that growing the graph is safe.
22. As the author, I want to anchor a second Module on a new Terminal Node and reuse the existing closure, so that later material does not mean starting again.
23. As the author, I want to edit a single Note by hand in Obsidian without going through the pipeline, so that small fixes stay cheap.
24. As the author, I want my ad-hoc edits held to the same schema as pipeline output, so that hand-editing is not a hole in the validation.
25. As the author, I want to extend the Archetype catalogue when the material needs something new, so that the closed set does not become a cage.
26. As the author, I want the house style written down, so that sixty Notes by different agents read as one voice.
27. As the author, I want British English throughout, so that spelling is consistent with the rest of my material.
28. As the author, I want to re-run generation and see a diff rather than a surprise, so that generated content is reviewable.
29. As the author, I want the App's framework choice left open, so that I am not committed to a stack by a decision made about content.

### As a Note Author agent

30. As a Note Author, I want a Context Pack naming exactly one Node, so that my task is unambiguous.
31. As a Note Author, I want each prerequisite's one-sentence summary in my Pack, so that I can build on them without reading their Notes.
32. As a Note Author, I want to know which Nodes will require mine, so that I set up what they need.
33. As a Note Author, I want the section skeleton already scaffolded, so that I write content rather than structure.
34. As a Note Author, I want the house style rules in my Pack, so that I do not have to infer the voice.
35. As a Note Author, I want the relevant source Notes in my Pack, so that I can cite rather than invent.
36. As a Note Author, I want the Archetype catalogue as names and one-liners, so that I can mark where an Interactive belongs without specifying it.
37. As a Note Author, I want never to write a reverse Edge, so that I cannot create an inconsistency.
38. As a Note Author, I want to be told the LaTeX subset I may use, so that my formulas do not fail validation.
39. As a Note Author, I want to flag a problem with the Anchor Graph without changing it, so that structural concerns reach a human.

### As an Interactive Author agent

40. As an Interactive Author, I want to read the drafted Note before choosing an Archetype, so that the Interactive fits what was actually written.
41. As an Interactive Author, I want the full parameter schema for each Archetype, so that I can produce a valid instance.
42. As an Interactive Author, I want to write a declarative specification rather than rendering code, so that my output is reviewable and cannot break the App.
43. As an Interactive Author, I want validation to reject an unknown Archetype or a bad parameter, so that a typo does not reach a learner as a blank box.
44. As an Interactive Author, I want to report that no Archetype fits, so that the catalogue can grow deliberately.

### As a Source Curator agent

45. As a Source Curator, I want to extract material from named high-trust references into an immutable raw store, so that provenance is preserved.
46. As a Source Curator, I want to write one source Note per reference, so that Notes can cite a stable target.
47. As a Source Curator, I want to record each notational convention a source uses, so that conflicts between sources are visible rather than averaged away.
48. As a Source Curator, I want never to modify raw material, so that the record of what a source said cannot drift.

### As a Correctness Reviewer agent

49. As a Correctness Reviewer, I want to see a whole Note plus its prerequisites' Notes, so that I can check it does not assume something untaught.
50. As a Correctness Reviewer, I want to check mathematical correctness separately from the agent that wrote the prose, so that review is not self-review.
51. As a Correctness Reviewer, I want to check that a Note's claims trace to a source where required, so that unsourced assertions are caught.
52. As a Correctness Reviewer, I want to mark a Note as agent-reviewed without marking it finished, so that human sign-off remains a distinct gate.
53. As a Correctness Reviewer, I want to see contradictions between sibling Notes in the same Layer, so that problems invisible to either author are caught.

### As the pipeline operator

54. As the operator, I want to scaffold all 61 Notes as stubs from the Anchor Graph in one command, so that every `requires` resolves before content exists.
55. As the operator, I want to generate the Context Packs for a whole Layer at once, so that I can run authors in parallel.
56. As the operator, I want the Layer ordering computed rather than maintained, so that it cannot go stale.
57. As the operator, I want generated sections rewritten idempotently, so that re-running generation is safe.
58. As the operator, I want the health check runnable as a pre-commit hook and in CI, so that violations are caught before they land.
59. As the operator, I want a non-zero exit code on a red metric, so that automation can gate on it.
60. As the operator, I want the dashboard regenerated from the same computation that gates the build, so that the human view and the machine view cannot disagree.

## Implementation Decisions

### Repository and vault topology

The Obsidian vault is scoped to `wiki/`; `.obsidian/` moves there from the repo root. The vault contains learning content only — no source code, no skills, no specs. Scripts live in `scripts/` at the repo root, outside the vault, written in Node. App source will be a sibling directory, out of scope here.

Wiki layout is flat at depth 1: `wiki/<domain>/<Note Name>.md`, with five domains derived from the Anchor Graph's four subgraphs plus one for the Terminal Node — `algebra`, `functions`, `limits`, `trigonometry`, `calculus`. Note filenames are Title Case with spaces, named for the concept, no numeric prefixes. Where a concept name contains a character illegal in a filename, the filename spells it out and the mathematical form goes in `aliases` (e.g. *Limit of sin h over h as h approaches zero*).

Non-Node files in the vault: `wiki/CLAUDE.md`, `wiki/index.md`, `wiki/Module 1 Anchor Graph.md`, `wiki/observability/Graph Health Dashboard.md`, `wiki/log.md`, source Notes under `wiki/sources/`, and `wiki/Conventions.md`.

Raw source material lives in `raw/` at the repo root, outside the vault, and is immutable.

### Frontmatter schema

Flat key-value pairs and arrays of scalars only; no nested objects. The complete set, per ADR-0003:

| Key | Required | Notes |
|---|---|---|
| `kind` | yes | closed enum: `concept`, `source`, `reference`, `observability` |
| `domain` | yes | must equal the containing directory |
| `requires` | yes | array of wikilinks; `[]` for a Floor Node |
| `status` | yes | closed enum: `stub`, `drafted`, `reviewed` |
| `reviewed_by` | yes | closed enum: `none`, `agent`, `human` |
| `created` | yes | set once, never modified |
| `updated` | yes | refreshed on substantive content edits only |
| `aliases` | no | array |
| `tags` | no | array |

Source Notes additionally require `source_file`, `source_type`, `date_ingested`.

Structural files (`CLAUDE.md`, `index.md`, `log.md`) carry no frontmatter and are excluded from every graph computation by that absence.

No `level`, `difficulty`, `depth`, `layer`, `is_floor`, `is_hub`, `link_count`, or `schema_version`. Any key not in the schema is a validation failure, not a warning.

### Edges and generated sections

`requires` is the only place an Edge is declared, written as wikilinks so Obsidian resolves them as real links in the graph view and backlinks. The reverse direction is never authored. Two sections per Note are machine-written between stable markers and rewritten idempotently on every generate run:

- `## Builds on` — each prerequisite as a wikilink plus its `## In one sentence` text
- `## Required by` — each requiring Node as a wikilink plus its one-liner

A third generated block is the Note's local prerequisite Mermaid mini-map, a `flowchart TD` of the Node, its direct prerequisites and its direct dependents. Hand-authored Mermaid is permitted only for genuinely structural pictures where no Archetype fits and interactivity would be decoration; it is never used for a prerequisite diagram.

### Note skeleton

Eight sections, written by the scaffold command, never retyped by an agent:

`## In one sentence` · `## Why you need this` · `## The idea` · `## Worked example` · `## Common mistakes` · `## Builds on` *(generated)* · `## Required by` *(generated)* · `## References`

`## In one sentence` is load-bearing beyond the Note itself: it is the text copied into downstream Context Packs, so it is capped at one sentence and validated as present and non-empty before `status: drafted`.

### The CLI

One entry point with subcommands, operating on a vault directory passed as an argument so it is testable against fixtures:

- **`scaffold`** — read the Anchor Graph, create every missing Note as a `status: stub` with correct `requires`, `domain`, `kind`, and the empty skeleton. Idempotent; never overwrites existing content.
- **`generate`** — rewrite the generated sections in every Note, regenerate `wiki/index.md`, regenerate the Dataview dashboard, and emit Context Packs for a named Layer.
- **`check`** — compute every metric, write the machine-readable report, print a human summary, exit non-zero on any red.

`generate` and `check` share one graph-loading and metric-computing core, so the dashboard and the gate cannot disagree (ADR-0002).

### Graph invariants — binary, blocking

Any failure is red and fails the build:

1. The Edge graph is acyclic.
2. Exactly one Node per Module has in-degree zero, and it is the declared Terminal Node.
3. Every path from the Terminal Node terminates at a Node with `requires: []`.
4. No Node is unreachable from the Terminal Node.
5. Every `requires` entry resolves to an existing Note.
6. Every `domain` equals its containing directory.
7. No frontmatter key outside the schema; no enum value outside its closed set.
8. Every `$…$` and `$$…$$` block parses under KaTeX.
9. Every `interactive` block names a known Archetype and validates against its parameter schema.
10. Every Note at `status: drafted` or above has non-empty `## In one sentence`.

11. The graph built from the Notes' `requires` is identical to the Anchor Graph.

12. Every file in `raw/` is tracked in `raw/checksums.sha256` and unchanged since extraction, and every source Note's `source_file` names one. *(Added by ticket 14.)*

13. `status` and `reviewed_by` agree: a `stub` is reviewed by `none`, a `drafted` Note by `none` or `agent`, a `reviewed` Note by `human`. *(Added 2026-10-03 after the Layer 0 sign-off, where a hand edit left a Note at `drafted` with no reviewer; the contract already forbade the pairs, and the gate now holds them.)*

These run at two different times, and conflating them was an error in an earlier draft of this spec. Invariants 1–4 are computed from the Anchor Graph file and are a regression gate **from the first commit**, before any Note exists. Invariants 5–10 are computed from the Notes and can only run once `scaffold` has created them. Invariant 11 joins the two and is what makes "agents never change the structure" enforceable rather than conventional; its failure message must name both directions of the mismatch, since adding a Node legitimately produces a one-sided mismatch until both sides are updated.

Invariants 1–4 hold on the Anchor Graph as it stands, verified: 61 Nodes, 97 Edges, acyclic, single root at *Derivative*, 61 of 61 reachable, 9 Floor Nodes.

One graph loader serves both sources. The Mermaid file and the Notes' frontmatter are two front-ends producing one in-memory representation, shared by `generate` and `check` — two independent graph builders would reintroduce exactly the dashboard-versus-gate divergence ADR-0002 exists to prevent.

### Graded metrics — green / yellow / red

Carrying over the reference wiki's threshold-table shape, which was its strongest artefact, but applied to Cross-references rather than Edges, because the template's `≥3 inbound and ≥3 outbound` floor is impossible for a prerequisite DAG — Floor Nodes have out-degree zero by definition and the Terminal Node has in-degree zero by definition.

| Metric | Green | Yellow | Red |
|---|---|---|---|
| Broken wikilinks | 0 | 1–3 | 4+ |
| Notes with zero Cross-references | <10% | 10–25% | >25% |
| Stale `updated` (>30d, non-reviewed) | <10% | 10–20% | >20% |
| Notes still `status: stub` after their Layer is opened | 0 | 1–3 | 4+ |
| Floor plausibility: `requires: []` Notes flagged above 8th grade | 0 | 1 | 2+ |
| Archetype coverage: Notes with no Interactive | <20% | 20–40% | >40% |

A Cross-reference is a link in authored prose between two concept Notes neither of which lies in the other's Prerequisite Closure. A link to anything a Note requires, directly or transitively, or to anything that requires it, restates an ordering the graph already makes and is never counted. *(Ruled 2026-10-03 on ticket 11, which had excluded direct Edges only.)*

Floor plausibility is the metric with no analogue in the reference wiki and the one most worth having: a Node with `requires: []` whose content is clearly above 8th grade is an unfinished expansion masquerading as a Floor Node, and it is the most likely silent failure in layered population. The check is a review judgement recorded in the report, not a computation.

### Interactive specification

A fenced block with language `interactive`, containing YAML naming an `archetype` and its parameters. No library name, no JavaScript expression, no component code (ADR-0004). Obsidian renders it as a plain code block, which satisfies the Q4 degradation requirement with no work.

Initial Archetype catalogue — thirteen, drafted against what Module 1's Nodes actually need, for the author to react to:

| Archetype | Serves |
|---|---|
| `function-plot` | function families, domain and range, plotting |
| `secant-to-tangent` | difference quotient, average rate of change, the derivative |
| `unit-circle` | unit circle and radians, quadrants and signs, special angles |
| `right-triangle` | right-triangle trigonometry, similar triangles, Pythagoras |
| `limit-table` | approaching a value, one-sided limits, numerical tables |
| `number-line` | absolute value, intervals and inequalities, closeness and distance |
| `transformation-explorer` | translations, reflections, stretches; period, amplitude, phase |
| `slope-triangle` | slope of a straight line, rise over run, coordinate differences |
| `piecewise-explorer` | piecewise functions, holes and jumps, continuity |
| `expression-stepper` | factorisation, simplification, index laws, algebraic fractions |
| `ratio-scaler` | ratios, proportion, units, average speed |
| `grid-plotter` | coordinates, tables and plotting (a Floor Node) |
| `squeeze-visual` | the sin h / h and (cos h − 1) / h limits |

Archetype components are implemented app-side and are out of scope here; what is in scope is the catalogue, each Archetype's parameter schema, and validation of instances against it.

### LaTeX

KaTeX-supported subset only, validated by `check` (ADR-0006). Inline `$…$` for mathematics inside a sentence, display `$$…$$` for standalone. The constraint exists because Obsidian renders with MathJax and the likely App renderer with KaTeX, so the binding dialect is the intersection.

### Agents

Five, each with a distinct input contract:

| Agent | Input | Output | Sets |
|---|---|---|---|
| Source Curator | a named reference | `raw/` extract + source Note + convention entries | — |
| Note Author | one Context Pack | one Note's prose sections | `status: drafted` |
| Interactive Author | one drafted Note + Archetype schemas | `interactive` blocks | — |
| Correctness Reviewer | one Review Bundle: the Note, its prerequisites' Notes, its Layer siblings' Notes | review findings in `.scratch/correctness-reviews/` | `reviewed_by: agent` |
| Archetype Builder | a catalogue gap | one Archetype's schema | — |

Human sign-off is the only route to `status: reviewed` and `reviewed_by: human`. No agent may set either.

The Correctness Reviewer's Review Bundle is generated by `generate --review <Note name>` into `.review-bundles/` beside the vault, like a Pack. Besides the Note, its prerequisites' Notes and its Layer siblings, it names every deeper Node in the Note's Prerequisite Closure and every Node outside it, so "untaught" is checkable against a list. A Floor Note's list leaves out the other Floor Nodes: the Floor is what the Module assumes. *(Added by ticket 16.)*

Note Author and Interactive Author stay separate and sequential: merging them forces the Archetype catalogue into every authoring Pack, and lets the Interactive be chosen against what was actually written rather than guessed alongside it.

### Context Packs

Generated per Node, written to a transient directory outside the vault. Contents: Node name and domain; the scaffolded skeleton; each prerequisite's `## In one sentence`; each requiring Node's one-liner; the Archetype catalogue as names and one-liners; the house style rules; the notation authority, `wiki/Conventions.md`; the source Notes for the Node's domain, selected by the domain in their `tags`, or a statement of which case an empty sources section means — no sources apply to a Floor Node, or none exists yet for the domain. Nothing else. *(Notation authority and the two empty cases added by ticket 15.)*

The rule attached to the Pack is as much a part of the design as the Pack: **the Note Author does not read the rest of the Wiki** (ADR-0005). Measured on the real graph, this costs almost nothing — at most 4 direct prerequisites, median 2.

### Population order

Bottom-up by Layer, parallel within a Layer. Layer is computed as longest path to the Floor, never declared. Module 1's shape, computed: 13 Layers; Layer 0 is 9 Floor Notes; Layers 0–4 hold 46 of 61 Notes and reach 11 wide; Layers 8–12 are single-Note Layers running *Limit of (cos h − 1) / h* → *Trigonometric limits* → *Trigonometric functions* → *Trigonometry* → *Derivative*. Parallelism is high early and near-sequential late, which is acceptable because the tail is 15 Notes.

### House style

Drafted for the author to react to:

- British English.
- Second person, present tense. "You can factorise this", not "one may factorise this".
- Define before use. No forward references except as explicitly marked Cross-references.
- Banned words: *simply*, *just*, *obviously*, *clearly*, *trivially*. They shame a stuck learner and carry no information.
- Concrete numbers before general forms in every worked example.
- `## Common mistakes` states the mistake as a learner would actually make it, then why it is wrong — not a list of rules.
- Notation follows `wiki/Conventions.md`. A convention conflict between sources is documented with both claims attributed, never silently resolved.
- Target 400–900 words for a non-Floor Note. Floor Notes may be shorter.

### `wiki/CLAUDE.md`

Short — target under 200 lines — and explicitly scoped to **ad-hoc human-directed edits**, not pipeline work. The Context Pack is the authority for the pipeline; `wiki/CLAUDE.md` governs a human or a Claude Code session changing one Note by hand. Naming that split is what keeps it from accreting into the reference wiki's 877 lines. Everything structural is referenced, not restated: the schema, the invariants and the style rules live in the ADRs, the spec and the style file.

## Testing Decisions

### What makes a good test here

Tests drive the CLI from outside and assert on observable output: files written, file contents, the machine-readable report, and the exit code. No test reaches into graph-loading, YAML parsing, or metric computation directly. A test that asserts on an internal function's return value is testing the implementation, and the implementation of all of this should be free to change.

### The seam

**One seam: the CLI boundary.** Every test constructs a fixture vault in a temporary directory, runs a subcommand against it, and asserts on the result. Nothing is mocked — the fixture vault is a real directory of real markdown, so a test exercises YAML parsing, graph construction, KaTeX validation and file emission together, which is how they will fail in practice.

This is a new seam because the repo has no code. It is the highest one available: above it there is only "run the whole pipeline with live agents", which is not a test.

### Modules tested

Only the CLI, through its three subcommands.

- **`scaffold`** — creates missing Notes with correct frontmatter and skeleton; is idempotent; never overwrites existing content; refuses to scaffold a Node absent from the Anchor Graph.
- **`generate`** — rewrites generated sections correctly and idempotently; leaves authored content untouched; produces correct reverse Edges; emits a Context Pack containing exactly the specified contents and nothing more.
- **`check`** — each of the ten invariants gets a fixture that violates it and a fixture that satisfies it, asserting on exit code and on the report naming that specific violation. Each graded metric gets fixtures at its green, yellow and red boundaries.

The highest-value tests are the negative ones. A `check` that passes a clean vault proves little; a `check` that catches an introduced cycle, a `requires` pointing at a deleted Note, a MathJax-only macro, and a `domain` that no longer matches its directory is the gate actually doing its job.

### Content tests

One exception to the seam, ruled on 2026-10-03 for the deviations tickets 07, 08 and 14 recorded. A **content test** may read one named content file directly — `wiki/Conventions.md`, `docs/archetype-catalogue.md`, the source Notes under `wiki/sources/` — and hold its shape: the entry format, the attribution rules, the closed families, a line budget. It never asserts anything a `check` invariant covers, and it never reads a concept Note. These files are rules other things rely on rather than content the pipeline produces, so a shape test on them guards the pipeline's inputs, not its implementation.

### Prior art

None — this is the repo's first code. The fixture-vault-in-a-temp-directory pattern is the convention this spec establishes, and later tests should follow it.

### Explicitly not tested

Agent output quality. A Note's mathematical correctness and pedagogical soundness are checked by the Correctness Reviewer and by human sign-off, not by assertions. The tests guarantee that structure, schema, links and LaTeX are sound — never that the mathematics is right.

## Out of Scope

The App, entirely: framework, routing, build, page templates, design, styling, navigation patterns, learning arcs as a UI concept, quizzes, tests, gamification, and progress tracking. These get a second grilling session once the Wiki is complete, functional and consistent. Several decisions above were made specifically to keep this open — ADR-0004 exists so that no content decision picks the App's framework.

Also out of scope: Archetype component implementations (app-side); Module 2 and beyond; any Node not in the frozen Anchor Graph; Obsidian Publish or any hosted vault; multi-user authoring; and content below the 8th-grade Floor.

## Further Notes

**The Anchor Graph is already verified.** 61 Nodes, 97 Edges, acyclic, single root at *Derivative*, nothing unreachable, 9 Floor Nodes forming a coherent 8th-grade boundary, 24 of 97 Edges crossing domains. Promoting `example_nodes.mmd` to `wiki/Module 1 Anchor Graph.md` is a move and a frontmatter addition, not a rewrite.

**Edge direction.** In the Anchor Graph, `A --> B` reads "A requires B" — the arrow points at the prerequisite, which is the opposite of the usual flow-diagram convention. Every tool that reads it must honour that.

**What this system deliberately does not do.** It does not let an agent decide what should exist, write a reverse Edge, declare a derivable fact, name a rendering library in content, read more of the Wiki than its Node needs, or mark its own work finished. Each of those is a removed class of error rather than a rule to be followed carefully.

**Transplanted from the reference wiki, with credit:** the green/yellow/red threshold table with a mandated action per level; one-concept-one-page with a mandatory pre-write search; `domain` ≡ directory; the `index.md` + `log.md` pair; contradictions documented with both claims attributed and never merged; and inline epistemic qualifiers. **Rejected from it:** the `≥3 inbound and ≥3 outbound` link floor and `≥5` density target (impossible for a DAG); hand-written bidirectional cross-linking (unbounded manual labour, now generated); the 15-section page template (decayed to 6 in practice because reproduction was manual); Dataview as the sole metric authority (unreadable by agents); and the overall governance-to-content ratio of roughly 1:3.5.
