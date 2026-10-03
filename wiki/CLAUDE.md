# Hand edits to the Wiki

This file governs a **hand edit**: a human, or a Claude Code session a human is directing,
changing one Note in this vault outside the pipeline. It does not govern pipeline work. A
Note Author, Interactive Author or other pipeline agent follows its own Context Pack or
contract, which is the authority there
([ADR-0005](../docs/adr/0005-authors-read-a-context-pack-not-the-wiki.md)), and stops reading
here.

A hand edit is held to exactly the rules pipeline output is held to. This file restates none
of them. It says where each one lives, and what a hand edit must leave alone.

## Where the rules live

Read the source for the part you are changing, not a summary of it.

| You are changing | The rule lives in |
|---|---|
| Prose in any authored section | [`docs/house-style.md`](../docs/house-style.md) |
| A symbol, or the word for an idea | [`Conventions.md`](Conventions.md), the notation authority |
| Mathematics in `$…$` or `$$…$$` | [ADR-0006](../docs/adr/0006-latex-is-restricted-to-the-katex-subset.md): KaTeX only |
| An `interactive` block | [`docs/archetype-catalogue.md`](../docs/archetype-catalogue.md) and [ADR-0004](../docs/adr/0004-interactives-are-archetype-instances.md) |
| Frontmatter | [the frontmatter schema](../.scratch/wiki-production-system/spec.md#frontmatter-schema) and [ADR-0003](../docs/adr/0003-frontmatter-stores-only-what-the-graph-cannot-derive.md) |
| A Note's sections | [the Note skeleton](../.scratch/wiki-production-system/spec.md#note-skeleton) |
| Anything `check` enforces | [the graph invariants](../.scratch/wiki-production-system/spec.md#graph-invariants--binary-blocking) and [graded metrics](../.scratch/wiki-production-system/spec.md#graded-metrics--green--yellow--red) |
| The words for the system's parts | [`GLOSSARY.md`](../GLOSSARY.md) |

## What a hand edit never touches

**A generated block.** Everything between `<!-- generated:start … -->` and
`<!-- generated:end … -->` is overwritten by `npm run generate`, so a hand edit there is
lost by design. To change what a block says, change what it is generated from — the other
Note's `## In one sentence` — and regenerate.

**A prerequisite entry.** `requires` is the Anchor Graph, copied into the Note, and the
Anchor Graph is frozen: [`Module 1 Anchor Graph.md`](Module%201%20Anchor%20Graph.md). Never
add, remove or rename an entry by hand. If an edit shows a prerequisite is wrong or missing,
that is a structural question for the author: write it down and leave `requires` as it is.

## Outside a hand edit

These are not one-Note changes, so they are not done by hand under this file:

- Adding, renaming, moving or deleting a Note. Each one changes the graph or breaks links;
  it starts at the Anchor Graph and is the author's decision.
- Sign-off. Only the author signs a Note off, by hand, in its frontmatter. A
  Claude Code session never does, even when directed to edit that Note.
- Raw source material in `../raw/`, which is immutable, and source Notes in `sources/`.
- Files the CLI writes: `index.md`, `log.md` and `observability/Graph Health Dashboard.md`.
  The Floor plausibility verdicts in `observability/Floor Plausibility.md` are the author's
  judgement, recorded by hand.

## After the edit

1. If you changed a Note's `## In one sentence`, run `npm run generate`: the Notes that
   require it copy that sentence into their `## Builds on`. Review the diff it produces.
2. Run `npm run check` from the repo root and read the summary, or
   `.wiki-health/report.json`. The edit is done when nothing it reports names the Note you
   changed.
