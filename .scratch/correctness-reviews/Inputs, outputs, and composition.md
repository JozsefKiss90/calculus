# Correctness review: Inputs, outputs, and composition

**Status:** ready-for-human

**Note:** [[Inputs, outputs, and composition]] (`wiki/functions/Inputs, outputs, and composition.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

Every calculation was redone and is correct: the table of $2x + 1$ ($-1, 1, 3, 5, 7$), both chains at $2$ ($25$ and $7$), both chains at $-1$ ($4$ and $4$), the general forms $(x + 3)^2$ and $x^2 + 3$, and the counterexamples $11$, $13$ and $25$. The non-function example ("a number whose square is the input" sending $9$ to $3$ or $-3$) does break the one-output requirement. No contradiction with any written Layer sibling was found, and no notation departs from `Conventions.md`. This is a Floor Node, so no `unsourced` finding applies.

### Findings

#### 1. untaught: expanding $(x + 3)(x + 3)$ in a common mistake

- **Where:** `## Common mistakes`, second mistake: "The square acts on the whole output of rule A, so the bracket must stay: $(x + 3)^2 = (x + 3)(x + 3) = x^2 + 6x + 9$, which at $x = 2$ is $4 + 12 + 9 = 25$."
- **What is wrong:** The arithmetic is right ($4 + 12 + 9 = 25$), but the step $(x + 3)(x + 3) = x^2 + 6x + 9$ is the expansion of a product of brackets and the collection of like terms. The Note does not teach it, and it is not marked as an aside.
- **Taught where:** [[Distributive law, expansion, and like terms]] teaches it, and that Node is in the Bundle's Not taught before it list, so it sits above the Floor and is not taught before this Note. (Its squared-bracket case also touches [[Common factors, quadratics, and difference of squares]], also in that list.)
- **What would fix it:** End the sentence at "so the bracket must stay: $(x + 3)^2$", which at $x = 2$ is $5^2 = 25$. The numbers $11$, $13$ and $25$ already show the mistake is wrong, so the correction does not need the expansion. Or mark the expansion as an aside the learner can skip, pointing to [[Distributive law, expansion, and like terms]].

#### 2. query: letters, substitution and brackets overlap a Node above the Floor

- **Where:** `## The idea`: "You can write a rule with a letter standing for the input. If $x$ is the input, "multiply by $2$, then add $1$" is $2x + 1$. To find an output, replace $x$ with the input and work it out." Also "the bracket tells you which step happens first."
- **What is wrong:** Not an error. [[Variables, substitution, and brackets]] is in the Not taught before it list, and the Note uses a letter for an input, substitutes into it, and reads a bracket as "do this first". The Note teaches each of these itself, briefly, before using them, so this is not counted as `untaught`. A human may want to confirm that this short treatment is enough, or whether the Anchor Graph expects letters and substitution to be Floor knowledge here.
- **What would fix it:** Nothing required. If the author judges the treatment too thin, add one sentence, or flag the Anchor Graph question for triage.

## Review 2

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Review 1's finding 1 is cleared. The second common mistake now ends "so the bracket must stay: $(x + 3)^2$ at $x = 2$ is $5^2 = 25$", with no expansion of $(x + 3)(x + 3)$. The learner's wrong expansion "$x^2 + 9$" is still named, but only as the mistake, and it is refuted with numbers alone, so the Note does not use the idea of expansion.

Every calculation was redone and is correct: $2 \times 3 + 1 = 7$; the table of $2x + 1$ at $-1, 0, 1, 2, 3$ gives $-1, 1, 3, 5, 7$; A then B at $2$ gives $5$, then $25$; B then A at $2$ gives $4$, then $7$; at $-1$ both orders give $4$ ($2^2 = 4$ and $1 + 3 = 4$); the general forms $(x + 3)^2$ and $x^2 + 3$ give $25$ and $7$ at $x = 2$; the counterexamples $2 + 9 = 11$ and $4 + 9 = 13$ both differ from $25$. The non-function "a number whose square is the input" really does allow two outputs, $3$ and $-3$, for the input $9$. "Order matters ... usually gives a different answer" is hedged and is shown by the input $2$, and the input $-1$ is correctly presented as a coincidence, not a proof. The one link above the Floor, [[Left-hand and right-hand limits]], is marked as an aside the learner can skip. Squaring and signed numbers are subjects of Floor siblings, so a Floor Note may use them. No contradiction was found with any written Layer sibling: the treatment of "square it" sending $3$ and $-3$ to $9$ agrees with [[Inverse operations]] and [[Multiplication, division, squares, and roots]]. No notation departs from `Conventions.md`. Brackets is the British term, and $\times$ is used between numbers. This is a Floor Node, so no `unsourced` finding applies.

### Findings

#### 1. query: letters, substitution and brackets overlap a Node above the Floor (carried from Review 1)

- **Where:** `## The idea`: "If $x$ is the input, "multiply by $2$, then add $1$" is $2x + 1$. To find an output, replace $x$ with the input and work it out." Also "the bracket tells you which step happens first."
- **What is wrong:** Not an error, and unchanged since Review 1's query 2. [[Variables, substitution, and brackets]] is in Not taught before it. The Note teaches a letter for the input and substitution itself, briefly, before it uses them, so this is not counted as `untaught`. A human may want to confirm that the treatment is enough.
- **What would fix it:** Nothing required.

## Review 3

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

The only change since Review 2 is a `function-machine` interactive block in `## Worked example`, after the input $-1$ comparison; `git diff` shows nothing else in the written sections. The block was checked against the `function-machine` entry of `docs/archetype-catalogue.md` and the `function` composite type:

- `machines` has 2 items, within `[1, 4]`. `linear` $[1, 3]$ is $1x + 3$, "add $3$", which is rule A. `quadratic` $[1, 0, 0]$ is $x^2$, the squaring machine the catalogue names, which is rule B. Each has the number of coefficients its family requires, and both labels are valid LaTeX that agrees with the coefficients.
- Listed first to act first, the machines run A then B, as in the Note's first chain. `swap: true` runs B then A beside it from the same input, which is the Note's second chain.
- `input: 2` is within `[-1000, 1000]` and is the input of both worked chains.
- No unknown parameter is present, and `caption` is plain text with no LaTeX.

Every number the block shows was redone. A then B at $2$: $2 + 3 = 5$, $5^2 = 25$. B then A at $2$: $2^2 = 4$, $4 + 3 = 7$. At $-1$: $-1 + 3 = 2$, $2^2 = 4$, and $(-1)^2 = 1$, $1 + 3 = 4$. The caption's claims ("2 becomes 5 and then 25, in the other 4 and then 7", "Try -1, where both orders give 4") are all correct, and the learner can change the input, as the schema says, so the invitation to try $-1$ can be followed. No machine in this chain fails for any input, so the no-output behaviour never arises.

The block uses nothing untaught. It shows composition, order and the letter $x$ for an input, all taught earlier in `## The idea`. Squaring and signed numbers are Floor siblings' subjects, which a Floor Note may use. The block agrees with the prose and with the catalogue's own example for this Note, which it matches exactly. It does not contradict the written Layer sibling [[Inverse operations]], which uses the same Archetype for undoing. The earlier calculations, re-checked, are unchanged and correct. No notation departs from `Conventions.md`. This is a Floor Node, so no `unsourced` finding applies.

### Findings

#### 1. query: `decimals` is left at its default of 2

- **Where:** the `interactive` block in `## Worked example`, which has no `decimals` line, with the caption "In one order 2 becomes 5 and then 25, in the other 4 and then 7."
- **What is wrong:** Not a mathematical error. The catalogue's default for `decimals` is `2`, "decimal places for every number passed along", so the machine may show $5.00$, $25.00$, $4.00$ and $7.00$ while the caption and prose say $5$, $25$, $4$ and $7$. Every number in this example is a whole number. The sibling [[Inverse operations]] sets `decimals: 0` on its squaring chain, and so does the catalogue's other example for this Note.
- **What would fix it:** Add `decimals: 0`, if the renderer does not already drop trailing zeros. A learner who types a decimal input would then see rounded outputs, so the author may prefer to leave the default.

#### 2. query: the machine label `x^2` reuses $x$ for the second machine's own input

- **Where:** the same block: `label: 'x^2'` on the second machine, beside `label: 'x + 3'` on the first.
- **What is wrong:** Not an error. The Note teaches that $x$ stands for a rule's input, so on each machine $x$ means that machine's input, and in the A-then-B chain the second machine's $x$ is $5$, not the starting $2$. Just after the block, the Note writes the chain's output as $(x + 3)^2$, with $x$ the starting input. A learner who reads the label $x^2$ as "square the starting number" would get $4$ rather than $25$, which is the first common mistake. [[Inverse operations]] labels its machines with operations ('\times 3', '+4', '\text{square}') and does not use $x$.
- **What would fix it:** Nothing required. Labels such as `'+ 3'` and `'\text{square}'` would avoid the double use of $x$, if the author thinks it could mislead.

#### 3. query: letters, substitution and brackets overlap a Node above the Floor (carried from Reviews 1 and 2)

- **Where:** `## The idea`: "If $x$ is the input, "multiply by $2$, then add $1$" is $2x + 1$. To find an output, replace $x$ with the input and work it out."
- **What is wrong:** Unchanged since Review 2. [[Variables, substitution, and brackets]] is in Not taught before it. The Note teaches these ideas itself before using them, so this is not `untaught`.
- **What would fix it:** Nothing required.

## Review 4

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

The Note matches the Bundle's copy and was at `kind: concept`, `status: drafted`, `reviewed_by: none`. Measured against the last commit, the written sections differ only in the `function-machine` block, and that block differs from the one Review 3 read only in its labels and its new `decimals: 0` line. `updated` is unchanged.

Review 3's queries are resolved:

- **Query 1 (`decimals`).** `decimals: 0` is now set, within the range `[0, 6]`. Every number the worked chains pass along ($2$, $5$, $25$, $4$, $7$, and at $-1$: $2$, $4$, $1$, $4$) is a whole number, so the machine now shows exactly what the prose and caption say. The catalogue entry now says rounding is "for display only: each machine passes on the exact value", so `decimals: 0` cannot change a later output.
- **Query 2 (`x^2` reusing $x$).** The labels are now `'+ 3'` and `'\text{square}'`. Neither uses $x$, so $x$ in the Note again means only the starting input, as in $(x + 3)^2$ and $x^2 + 3$. Both labels are valid KaTeX for the `latex` type a `function` label takes. They agree with the coefficients: `linear` $[1, 3]$ is $1x + 3$, "add $3$", which is rule A, and `quadratic` $[1, 0, 0]$ is $x^2$, the squaring machine the catalogue names, which is rule B. They use the Note's own words, "add $3$" and "square it", and match how the sibling [[Inverse operations]] labels its machines (`'\text{square}'`, `'\times 3'`).

The rest of the block was re-checked against the catalogue: 2 machines, within `[1, 4]`. Each has the number of coefficients its family requires. Listed first to act first, the machines run A then B, and `swap: true` runs B then A beside it. `input: 2` is within `[-1000, 1000]`. No unknown parameter is present, and the caption is plain text. The block is identical, line for line, to the catalogue's example for this Note. The numbers were redone: A then B at $2$ is $5$ then $25$; B then A at $2$ is $4$ then $7$; at $-1$ both orders give $4$. The caption is correct. No machine fails for any input.

The prose is unchanged since Review 3. Its calculations, re-checked, are still correct: the table of $2x + 1$, the chains, $(x + 3)^2$ and $x^2 + 3$ at $x = 2$, and the counterexamples $11$ and $13$. Nothing untaught is used, and the only link above the Floor, [[Left-hand and right-hand limits]], is a marked aside. No contradiction with a written Layer sibling was found, and no notation departs from `Conventions.md`. This is a Floor Node, so no `unsourced` finding applies.

### Findings

#### 1. query: with `decimals: 0`, a non-whole input the learner types shows rounded steps that do not add up

- **Where:** the `interactive` block in `## Worked example`: `decimals: 0`, together with the catalogue's "The learner can change it".
- **What is wrong:** Not an error in the Note, and the worked numbers are unaffected. The catalogue now passes on the exact value and rounds only for display, so the final outputs are right. But a learner who types $0.5$ would see A then B as $3.5 \to 12.25$ displayed as whole numbers, such as $4$ and then $12$, although $4^2 = 16$. Each step shown would look wrong. Review 3 named this trade-off. The caption invites only whole inputs ($-1$), so this arises only if the learner goes beyond it.
- **What would fix it:** Nothing required. If the author wants decimal inputs to read correctly, leave `decimals` at a value such as `2`, provided the renderer drops trailing zeros. That is a renderer question for the catalogue, not this Note.

#### 2. query: letters, substitution and brackets overlap a Node above the Floor (carried from Reviews 1 to 3)

- **Where:** `## The idea`: "If $x$ is the input, "multiply by $2$, then add $1$" is $2x + 1$. To find an output, replace $x$ with the input and work it out."
- **What is wrong:** Unchanged. [[Variables, substitution, and brackets]] is in Not taught before it. The Note teaches these ideas itself before using them, so this is not `untaught`.
- **What would fix it:** Nothing required.

## Comments
