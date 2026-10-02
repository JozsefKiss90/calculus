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

No dependencies and no install step, here or in CI. Tests drive the CLI from outside against
fixture vaults in temporary directories; nothing is mocked. See
[the testing decisions](.scratch/wiki-production-system/spec.md#testing-decisions).

## Where things are

| Path | What |
|---|---|
| `wiki/` | The Obsidian vault: learning content only |
| `scripts/wiki.js` | The one CLI entry point |
| `raw/` | The immutable raw source store |
| `docs/adr/` | The decisions that govern the system |
| `GLOSSARY.md` | The vocabulary |
| `.scratch/` | Specs and tickets — this repo's issue tracker |
