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

From 18, which ran the nine Layer 0 Packs through real Note Authors. These are what the Pack lacked. None was patched in place.

- **No Node to cross-reference.** A Pack names only the Node's Edges: Builds on and Required by. A link along an Edge does not count for the zero-Cross-references metric, so a Floor Note cannot meet that metric from its Pack alone. Five of nine authors went outside the Pack to find a target. Three took a Node name from `Conventions.md`, and two used `check`'s report or the directory listing. Two of the resulting links are forced: *Inputs, outputs, and composition* and *Decimals, ordering, and number lines* both point at *Left-hand and right-hand limits*, the one later Node `Conventions.md` happens to name. Two Notes found no target and are still listed. A Pack likely needs a short list of Nodes where its idea reappears, or the metric should not apply to the Floor.
- **The word limit is ambiguous.** The house style does not say how inline `$…$` counts towards 900 words. *Factors and multiples* is about 760 words one way and 935 the other.
- **`Conventions.md` has no entry for terms several authors needed.** Each author used the British school form:
  - $\sqrt{\ }$ as the non-negative root
  - $\pm$, $\neq$, and $\div$ as a sign in its own right
  - $<$, $>$, $\leq$ and $\geq$
  - numerator, denominator, simplest form, cancelling
  - factor, multiple, prime, HCF and LCM
  - coordinates, ordered pair, origin and axes
  - function, input, output and composition
  - mixed numbers
- **The house style has no rule for the zero case of a general claim.** Review blocked six of nine Notes on an `error`. Most were a general rule that fails at an edge case:
  - the sign rule when a factor is 0
  - a zero numerator over a zero denominator
  - adding the same number to the top and bottom of a fraction equal to 1
  - "draw a smooth curve" for $|x|$
  - "each digit" for "each place"

  The *Signed arithmetic* error is the one ticket 16 caught in the earlier draft, made again by a fresh author from a fresh Pack. A house style rule along the lines of "test every *always*, *never* or *any* claim against 0, negatives and equal values" might catch these before review.
- **Writing through a bash heredoc corrupts LaTeX.** One author's first write turned `\f` in `\frac` into a form feed. The Note Author contract could say to write the Note with the Write or Edit tool.
