# 15: Context Packs for a Layer

**What to build:** The generated briefing that replaces exploration, and the agent that consumes it. Layer is computed as longest path to the Floor, never declared. `generate` emits one Pack per Node for a named Layer into a transient directory outside the vault, containing exactly: Node name and domain; the scaffolded skeleton; each prerequisite's one-sentence summary; each requiring Node's one-liner; the Archetype catalogue as names and one-liners; the house style rules; the notation authority; and the source Notes for the Node's domain. Nothing else.

The Pack must distinguish "no sources apply" from "no sources exist yet". Layer 0 is nine Floor Notes about signed arithmetic, fractions and plotting points, whose claims are elementary and need no citation, so an empty sources section there is the right answer rather than a gap being tolerated. An author who cannot tell the two apart will take the generous reading and write uncited.

The Note Author contract comes with it: one Pack, one Node, and it does not read the rest of the Wiki (ADR-0005).

**Blocked by:** 06, 07, 08, 13

**Status:** ready-for-human

- [x] Layer is computed; the Layer 0 run emits nine Packs, and the computed Layer count for Module 1 is 13
- [x] A Pack contains exactly the specified contents and nothing more, with a test asserting on the absence of anything else
- [x] Packs are written outside the vault, and no Pack is ever committed into `wiki/`
- [x] A Pack's sources section says which of the two cases it means: no sources apply to this Node's claims, or no source Note exists yet for this domain
- [x] A Pack carries the house style rules and the notation authority verbatim, not summarised
- [x] The Note Author contract sets `status: drafted` and nothing else, never writes a reverse Edge or a generated block, and has a defined way to flag an Anchor Graph problem without changing it
- [x] A Note drafted from a Pack alone passes `check`

## Comments

From 15, which implemented it. `npm run generate -- --layer <N>` rewrites the blocks as before, then writes one Pack per Node in computed Layer N to `.context-packs/layer-<N>/<Note name>.md`, beside the vault. That directory is gitignored, and each run replaces it. The code is `scripts/lib/context-packs.js`, and the contract is `.claude/agents/note-author.md`. `tests/context-packs.test.js` covers every criterion but the last, through the CLI. `tests/note-author.test.js` covers the last.

**A Pack's shape.** It has a title line, then eight sections in a fixed order: Node, Skeleton, Builds on, Required by, Archetype catalogue, House style, Notation authority, Sources. The test writes the whole expected Pack out and compares it byte for byte, so anything extra fails. Absence tests also name the likeliest leaks: Layer siblings, the Anchor Graph, a prerequisite's prose, Layer numbers, schema tables and other domains' sources. Whole files go in fenced blocks: the house style, `Conventions.md`, each source Note and the Note itself. Their own `##` headings then cannot pass for the Pack's sections. The content is verbatim apart from line endings, which are LF. The skeleton is the Note as it stands after the block rewrite, generated blocks included.

**Judgements for the author:**

- **A Floor Node gets "no sources apply" even when its domain has sources.** *Decimals, ordering, and number lines* is a Floor Node in `limits`. Under the spec's rule alone, it would get the OpenStax limits section. The ticket's reasoning is that Floor claims need no citation, so this follows the ticket over the spec.
- **"No source Note exists yet" tells the author to report each claim that needs a source, rather than write it uncited.** The contract says the same.
- **The Note Author sets `updated` as well as `status: drafted`.** I read "nothing else" as covering the review state, which is `status` and `reviewed_by`. Leaving `updated` alone would let a Note drafted 30 days after scaffolding grade stale on the day it is written. Change the contract if you meant it literally.
- **Anchor Graph flags** go to `.scratch/anchor-graph-flags/issues/NN-<name>.md` at `needs-triage`, in the same shape as Archetype gaps. `requires` never changes because of one.
- **A Layer that does not exist, or a missing `Conventions.md`, exits 2 and writes no Packs.** The blocks are still rewritten first.

**The last criterion was met by a real run.** A general-purpose agent read only the contract and the Layer 0 Pack for *Signed arithmetic and order of operations*, in a scratch copy of the vault. The Pack and the Note it drafted are in `tests/fixtures/note-author/`. In a copy of the real vault, that Note holds all 12 invariants. Its frontmatter differs from the stub only in `status` and `updated`, and its generated blocks are untouched. It is not committed into `wiki/`; taking a Note into the vault is 18's job.

**What the author agent found missing from the Pack (for 18 to confirm or fix):**

- The house style does not say whether inline `$…$` counts towards the word limit. The draft comes to roughly 780 words or 890, depending on the answer.
- `Conventions.md` has no entry for the unary minus against an index ($-3^2$), the minus sign as "opposite" against subtraction, brackets round a negative after an operator, or $\div$ in general.
- At Layer 0, no Required by Node has a summary yet, so the author had to guess what those Nodes need. That follows from writing bottom up, not from the Pack.
- `## Why you need this` names the Required by Nodes as wikilinks. The house style allows a forward wikilink only as a marked aside, and does not say whether a sentence that names a later Node counts. The Cross-references metric did not count these links.

**"Passes `check`" means passes its invariants.** With one Note written, `check` still exits 1 on the real vault, for reasons that have nothing to do with the Note. The other eight Layer 0 stubs make the stubs-in-an-opened-Layer metric red. A lone written Note is also 100% of the written population for the Cross-reference metric. The test asserts that no invariant fails. 18 is where a whole Layer is written and `check` exits 0.

**The Pack fixture is a record, not a regression target.** The test does not compare it with what `generate` writes today, so a house style edit does not break it. Re-run the author when the Pack changes in a way that would change the writing.

ADR-0005's list of Pack contents is amended to match the spec.
