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

## Comments
