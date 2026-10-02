# 07: KaTeX subset validation and the notation authority

**What to build:** Mathematics that renders in one tool and breaks in the other cannot land, and notation gains a single authority. `check` enforces invariant 8: every inline and display mathematics expression in every Note parses under KaTeX. That means a real KaTeX dependency in `scripts/`, not a regex — Obsidian renders with MathJax and the likely App renderer with KaTeX, so the binding dialect is the intersection.

Alongside it, `wiki/Conventions.md` is created as the notation authority that the house style and every Note defer to: which symbol and term means what, and where sources disagree, both claims attributed and never silently resolved. It is seeded with the conflicts that bite at the Floor — order-of-operations naming, BIDMAS against PEMDAS, given British English throughout.

**Blocked by:** 05

**Status:** ready-for-human

- [x] A MathJax-only macro in a Note fails `check` with a non-zero exit and a report naming the Note and the offending expression
- [ ] Valid KaTeX inline and display mathematics passes, and renders in Obsidian — passes `check` (tested, and the 55 expressions in `wiki/Conventions.md` parse); **rendering in Obsidian needs a human**
- [x] Both inline and display forms are validated, and a dollar sign inside a fenced code block is ignored
- [x] `wiki/Conventions.md` exists with valid frontmatter and records the order-of-operations convention with both namings attributed
- [x] A convention entry has a fixed shape: the symbol or term, this Wiki's choice, and any conflicting source convention with its attribution
- [x] The file is short enough to go into a Context Pack whole, and is written to be read by an author mid-sentence

## Comments

**KaTeX is vendored, not installed.** `scripts/vendor/katex/katex.mjs` is KaTeX 0.19.0's
own ES module build, unmodified, with its MIT licence and a README giving the version, the
checksum and how to update it. That keeps the promise in the README and CI that there is no
install step, while still being the real parser the ticket asks for. `.gitattributes` keeps
the file byte-for-byte (`-text`) and out of diffs.

**Invariant 8** covers every Note with frontmatter, not only concept Notes: the Anchor Graph
Note and Conventions.md can reach a Page too. Failures name the Note, the line, inline or
display, and the exact expression; the message carries KaTeX's reason without its combining
underlines. KaTeX runs with `strict: "ignore"`, because its strict warnings are about
LaTeX compatibility (Unicode in maths), which MathJax accepts, not about MathJax.

**Finding the mathematics** is meant to agree with Obsidian:
- Fenced blocks, code spans, HTML comments and `%%` comments are not prose.
- `\$` is a dollar sign.
- Inline `$…$` follows Pandoc's rule, so "$5 and $2" is prose.
- An unclosed `$$` is its own failure, `unclosed-display-maths`.

Two places it may still differ from Obsidian, neither verified against Obsidian itself:
- A closing `$` followed by a digit does not close here.
- A `$$` left open before a later display block pairs with that block, and surfaces as a KaTeX rejection rather than as unclosed.

**Conventions.md** is a `kind: reference` Note at the vault root, `status: drafted`, 85
lines. Each entry is a `###` term, one **This Wiki** line, and **Elsewhere** lines of the
form "convention — who uses it", or "none known". Attributions name communities ("US
schools"), not books, because no source Notes exist yet. Ticket 14 should replace them
with links to source Notes. It goes past the Floor in a few entries, such as slope, intervals and
inverse trigonometric functions, because those are the conflicts a learner of this Module
meets. *Slope* follows the frozen Node name, and *gradient* is recorded as the British
school term.

**One deviation from the testing standard, for a human to rule on:** `tests/conventions.test.js`
reads `wiki/Conventions.md` directly instead of driving the CLI. It checks the entry
shape, the BIDMAS/PEMDAS entry and the 120-line budget. These are rules about one content
file, not invariants `check` is specified to enforce. The alternatives are to amend the spec's testing
decisions to admit content tests, or to delete the test and rely on review.
