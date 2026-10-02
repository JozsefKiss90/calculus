# 08: Archetype catalogue and parameter schemas

**What to build:** The thirteen Archetypes written down as reviewable parameter schemas, shipped first so the author can react before anything validates against them. For each Archetype in the spec's catalogue: its name, the one-liner that goes into a Context Pack, what it serves, and its full parameter schema — every parameter, its type, whether it is required, its default, its allowed range. No library name, no JavaScript expression, no component code (ADR-0004).

This is a design deliverable, not an implementation. It ships ahead of 09 and 10 precisely because if the catalogue is wrong, the validator and both agent contracts are built on sand. Archetype component implementations are app-side and out of scope.

**Blocked by:** 01

**Status:** done

- [x] All thirteen Archetypes have a complete parameter schema; none is a placeholder
- [x] Each schema is declarative and names no rendering library, framework or expression language
- [x] Each Archetype carries a one-liner short enough to go into a Context Pack unmodified
- [x] At least one worked example instance per Archetype, drawn from a Node in the Anchor Graph that actually needs it
- [x] The catalogue records that it is a closed set, extended only through the Archetype Builder
- [x] The author has reviewed and reacted to the catalogue before 09 starts

## Comments

**Where it lives.** [`docs/archetype-catalogue.md`](../../../docs/archetype-catalogue.md): it is
outside the vault because it is not learning content and the spec's list of non-Node vault
files has no place for it. It is one markdown file, not markdown plus JSON, so what the author
reviews is exactly what 09 will validate against. There is no second copy to drift. Each
schema is a table with fixed columns (Type, Required, Default, Range, Meaning), written in a
small type grammar and range grammar defined at the top. The grammar covers every constraint,
including those between parameters: `within`, `differs from`, `needs`, `only when p is v`.
It also covers each family's exact coefficient count, given by the family table. So 09 can
validate from the tables without hard-coding any rule. 09's validator should own the one
parser of these tables. The test's parser is scaffolding, and once 09 lands the test should
call the validator's parser instead of keeping its own. An Archetype Builder appends one more
section in the same shape.

**Decisions for the author to react to:**

- **There is no expression language.** A function is chosen from nine closed families
  (`linear`, `quadratic`, `polynomial`, `rational`, `absolute`, `square-root`, `sine`,
  `cosine`, `tangent`) by its coefficients, never written as a formula. That is the only way
  to keep "no JavaScript expression" from turning into "a mini expression language". The cost
  is that a curve outside those families, such as $\frac{\sin x}{x}$ in a `limit-table`,
  cannot be drawn without a new family. That is why the two trigonometric limits have their
  own `squeeze-visual` rather than reusing `limit-table`.
- **Angles are degrees** everywhere except `squeeze-visual`'s `h` and the trigonometric
  families' input, which are radians. A `number` cannot be written as `pi`, so a radian
  default could only be a decimal.
- **`span`** reuses `wiki/Conventions.md`'s interval notation as a type (`'[-2, 3)'`) and adds
  `-inf`/`inf` at an open end. Conventions.md does not define how infinity is written yet, so
  it may want an entry.
- **Every Archetype has a `caption`** (optional `text`): one line saying what to notice. It
  also reads well when the block degrades to plain text in Obsidian.
- **`latex` values are single-quoted** in YAML. In a double-quoted string the `\f` of
  `\frac` becomes a form feed.
- **`number-line` and `grid-plotter` have no required parameter.** A bare instance is
  valid and shows a blank line or grid. The catalogue says so, so the validator need not
  special-case it.
- **Ranges are generous bounds**, not pedagogical advice. They exist so that a typo
  (`h: 0`, `angle: 900`) fails, not to steer authors.

**Nodes no Archetype serves well**, as candidates for the Archetype Builder rather than for
this ticket: *Inputs, outputs, and composition* (a function machine), *Factors and multiples*
(a factor tree or array), *Inverse operations* and *Equations and rearranging formulas*
(only `expression-stepper` with `connective: implies`, which is static), *Limit laws and
substitution*, and *Trigonometric identities* (only `unit-circle`). The hub Nodes (*Algebra*,
*Limits*, …) probably want no Interactive. That matters for the Archetype-coverage metric in
ticket 11.

**The same deviation from the testing standard as 07, for the author to rule on:**
`tests/archetype-catalogue.test.js` reads the catalogue directly instead of driving the
CLI. It holds the shape the validator and agents will rely on:
- exactly the spec's thirteen Archetypes, in order
- every type defined, and the function families closed
- Required is yes or no; a required parameter has no default and an optional one has a
  default or `none`
- every default inside its own range, including `within`, and every range in the grammar
  with every parameter it names present
- one-liners of at most 120 characters, one sentence each
- no library, framework or expression syntax named anywhere
- every Archetype has an example from a real Note that uses only its own parameters and
  includes the required ones

It does not type-check example values. That is 09's validator, and 09's "a valid instance of
each of the thirteen Archetypes passes" can use these examples as its fixtures. A review
checked every example value against its schema, and the arithmetic in every caption, by hand.
The LaTeX in the examples was run through the vendored KaTeX, and all of it parses.

**Closed 2026-10-02.** The author reviewed the catalogue and accepted it as written, so ticket 09 is unblocked.
