# 09: Interactive block validation

**What to build:** Invariant 9 — every interactive block names a known Archetype and validates against its parameter schema. A fenced block with language `interactive` containing YAML; an unknown archetype name, a missing required parameter, an unknown parameter, a wrong type or an out-of-range value each fail the build, so a typo cannot reach a learner as a blank box. Mechanical work against the catalogue reviewed in 08.

The degradation requirement needs no work here: Obsidian renders the block as plain text, so a learner reading the Wiki directly sees a readable specification rather than a broken embed.

**Blocked by:** 05, 08

**Status:** done

- [x] A block naming an Archetype outside the catalogue fails with a non-zero exit and a report naming the Note and the unknown name
- [x] A missing required parameter, an unknown parameter, a wrong type and an out-of-range value each fail, and are each named distinctly in the report
- [x] A valid instance of each of the thirteen Archetypes passes
- [x] Malformed YAML inside the block is a validation failure with a useful message, not a crash
- [x] A Note containing a valid block is readable in Obsidian with the block visible as text — passes `check`, and the block's LaTeX is not read as Note mathematics (tested); the author confirmed it in Obsidian

## Comments

**Where it lives.** Invariant 9 runs in `check` between 8 and 10. It covers every Note with
frontmatter, as invariant 8 does. The work is split across four modules:
- `scripts/lib/archetype-catalogue.js` is the one parser of the catalogue's tables.
- `scripts/lib/interactives.js` gives each word of the type and range grammar its meaning.
- `scripts/lib/yaml.js` reads the YAML in a block.
- `scripts/lib/fences.js` finds fenced blocks. `maths.js` now uses it too, so invariants 8 and 9
  cannot disagree about where a block ends.

The validator knows no Archetype, parameter or family by name. Everything comes from the
catalogue, including each family's coefficient count, read from the family table. An
Archetype the Builder adds is validated as soon as it is in the file. A catalogue the parser
cannot read in full, or one that breaks its own rules, stops `check` with exit 2 before any
Note is judged. Examples of breaking its own rules: a default outside its range, a Range
naming a missing parameter, or a misspelt heading.

**What the report says.** Each failure names the Note, the line (the parameter's own line
where there is one), the block's opening line as `block`, the parameter's path
(`functions[1].coefficients`, counting from 0) and a slug:
- The ticket's four kinds: `missing-parameter`, `unknown-parameter`, `wrong-type` and
  `out-of-range`. `out-of-range` covers bounds, `excluding`, item counts, `within`,
  `differs from` and the family coefficient counts.
- Before those: `unknown-archetype`, `missing-archetype` and `malformed-yaml`.
- Beyond the four: `unmet-condition` for `needs` and `only when`, which are about another
  parameter rather than this value. `katex-rejects` for a `latex` value KaTeX refuses,
  because the catalogue says latex is "checked like every other expression in a Note".
  `unclosed-interactive-block` for a block that is never closed.
- An unknown Archetype or parameter within two edits of a real one gets "did you mean …?".

**YAML without a library.** The App will read these blocks with a real YAML parser, so
`yaml.js` keeps YAML's meaning wherever it accepts something, and refuses with a reason what
it does not support. Things YAML reads in a way an author might not expect:
- Plain values resolve by YAML 1.2's core schema. `'60'` is text, and `yes` is not a boolean.
- A `latex` value holding a control character fails with "single-quote LaTeX". That is
  `"\frac"` after YAML turns `\f` into a form feed. `"\sqrt"` is already invalid YAML.
- `{label:time}` is one value in YAML, not a key and a value, and is refused.
- `text` refuses `$`, `\`, backticks, `[[` and `**`. The catalogue says text has "no LaTeX
  and no markup".

**For the author to rule on:**
- **A `rational` function without `denominator` passes.** The catalogue says "A `rational`
  function needs it", but its Range is only `only when family is rational`, and the grammar
  has no "required when" term. Enforcing it means hard-coding a rule the tables do not hold,
  so it is not enforced. The fix belongs in the catalogue: a new grammar term such as
  `needed when family is rational`, added through review. `denominator: [0]` also passes.
- **"Written out in full" is not enforced for numbers.** `0x3C`, `6e1` and `3.0` pass as 60,
  60 and 3. The App's YAML parser reads the same values, so nothing reaches a learner
  differently. Enforcing the spelling would need the YAML reader to keep source text for
  every scalar.
- **The testing deviation from 08 grew.** As 08's comment asked,
  `tests/archetype-catalogue.test.js` now calls the validator's parser and asserts on the
  parsed catalogue, including the shape of the family counts. It also feeds the parser
  broken copies of the real catalogue to show each is refused. No CLI test supplies a broken
  catalogue to `check`, because `check` always reads the repo's own file.
- **`tests/precommit-and-ci-gate.test.js` › "CI runs the same npm scripts…" fails on this
  Windows checkout.** It failed before this ticket: `check.yml` is checked out with CRLF line
  endings and the test's regex expects LF. It is unrelated, so it was left alone.

**Obsidian.** Nothing in the block is Obsidian syntax, and an unknown fence language renders
as a code block.

**Closed 2026-10-02.** The author pasted the `limit-table` example into *Approaching a value*,
and it showed in Obsidian's reading view as a plain code block, every line readable, with
`check` passing. The rulings listed above (rational without `denominator`, numbers written
out in full, the test deviation) remain open for the author; none blocks this ticket.
