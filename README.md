# calculus

Tooling that produces and validates the Calculus Wiki. The Wiki is an Obsidian vault in
`wiki/`; this repo is the production system around it, not the App.

The structure is decided and frozen before any content is written: `wiki/Module 1 Anchor
Graph.md` holds the Anchor Graph, and the invariants in
[the spec](.scratch/wiki-production-system/spec.md) hold the repo to it.

## Check the Wiki

```sh
npm run check
```

Prints a human summary, writes the machine-readable report to `.wiki-health/report.json`,
and exits non-zero if anything is broken — 1 if an invariant failed, 2 if the check could
not run at all. The report is a file you can read from a terminal without opening Obsidian:

```sh
cat .wiki-health/report.json
```

Mathematics is checked too: every `$…$` and `$$…$$` in every Note must parse under KaTeX,
because Obsidian renders with MathJax and the App with KaTeX, and only what both accept is
safe ([ADR-0006](docs/adr/0006-latex-is-restricted-to-the-katex-subset.md)). A macro that
renders fine in Obsidian can still fail here — that is the check doing its job. Code blocks,
code spans and `\$` are not mathematics. KaTeX itself is vendored, pinned, in
[`scripts/vendor/katex/`](scripts/vendor/katex/README.md).

Which symbol and which word to write is decided in [`wiki/Conventions.md`](wiki/Conventions.md),
the notation authority every Note follows.

Interactives are drawn from a closed set of Archetypes, each with a parameter schema, in
[`docs/archetype-catalogue.md`](docs/archetype-catalogue.md). An Interactive names one
Archetype and fills in its parameters. It never names a rendering library or contains code
([ADR-0004](docs/adr/0004-interactives-are-archetype-instances.md)). `check` validates every
` ```interactive ` block against the catalogue itself, so a typo fails the build instead of
reaching a learner as a blank box. The report names each mistake by kind: an unknown
Archetype or parameter, a missing parameter, a wrong type, a value out of range, or YAML that
cannot be read. Single-quote LaTeX in a block (`label: '\frac{1}{x}'`), because in double
quotes `\f` is a form feed. Editing the catalogue changes what `check` accepts, and a
catalogue that breaks its own rules stops `check` with exit code 2.

## Scaffold the Notes

```sh
npm run scaffold
```

Creates the stub Note for every Node in the Anchor Graph that does not have one yet — frontmatter,
`requires` as wikilinks, and the eight-section skeleton — so every prerequisite link resolves
before any content exists. It only ever creates: a Note that already exists is never touched,
so running it again is safe and reports no change. To scaffold particular Nodes, name them:

```sh
node scripts/wiki.js scaffold wiki "Factorisation" "Continuity"
```

A Node the Anchor Graph does not have is refused, and nothing is written.

## Generate the reverse direction

```sh
npm run generate
```

A Note declares only what it requires. This writes everything that follows from that into
each concept Note, between `<!-- generated:start … -->` and `<!-- generated:end … -->`
markers: `## Builds on` (each prerequisite, with its one-sentence summary), `## Required by`
(each Note that requires it), and a mermaid mini-map of the Note and its direct neighbours,
arrows pointing at the prerequisite as in the Anchor Graph.

Nothing outside the markers is touched, and `requires` is only ever read. **Anything inside
the markers is overwritten on every run**, so a hand edit there is lost by design: change
`requires`, or the other Note's `## In one sentence`, and regenerate. Running it again on an
unchanged vault changes nothing, so after a graph change the diff is the review.

## Install the gate

```sh
git config core.hooksPath .githooks
```

One command, once per clone. From then on `git commit` runs `npm run check` and refuses the
commit if it fails, showing the same summary you would see running it yourself. The hook
adds no rules of its own, so every invariant and metric added to `check` later is enforced
locally the moment it ships.

The hook is deliberately skippable — `git commit --no-verify` — because it is a fast local
warning, not the authority. CI is the authority: [`.github/workflows/check.yml`](.github/workflows/check.yml)
runs `npm run check` and `npm test` on every push, so a structural violation cannot land
whether or not the committer ever ran the setup step above.

## Run the tests

```sh
npm test
```

No install step, here or in CI: the one third-party library, KaTeX, is vendored. Tests
drive the CLI from outside against fixture vaults in temporary directories; nothing is
mocked. See [the testing decisions](.scratch/wiki-production-system/spec.md#testing-decisions).

## Where things are

| Path | What |
|---|---|
| `wiki/` | The Obsidian vault: learning content only |
| `scripts/wiki.js` | The one CLI entry point |
| `raw/` | The immutable raw source store |
| `docs/adr/` | The decisions that govern the system |
| `docs/archetype-catalogue.md` | The closed set of Archetypes every Interactive instantiates, with their parameter schemas |
| `GLOSSARY.md` | The vocabulary |
| `.scratch/` | Specs and tickets — this repo's issue tracker |
