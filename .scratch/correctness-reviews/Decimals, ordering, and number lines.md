# Correctness review: Decimals, ordering, and number lines

**Status:** needs-triage

**Note:** [[Decimals, ordering, and number lines]] (`wiki/limits/Decimals, ordering, and number lines.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

### Findings

#### 1. error: place value stated for digits rather than places

- **Where:** `## The idea`, **Place value.** paragraph: "Each digit of a decimal is worth ten times the digit to its right."
- **What is wrong:** Read as written, this says the value of each digit is ten times the value of the digit beside it, which is false for the Note's own example. In $3.47$ the digit $3$ is worth $3$ and the digit $4$ is worth $\frac{4}{10} = 0.4$, and $10 \times 0.4 = 4 \neq 3$. Likewise the $4$ is worth $0.4$ and the $7$ is worth $0.07$, and $10 \times 0.07 = 0.7 \neq 0.4$. The rule holds for the places (columns), not for the digits in them: each place is worth ten times the place to its right. The next sentence, "The digits after the decimal point count tenths, then hundredths, then thousandths", is right, but a learner who takes the first sentence at face value learns a false rule.
- **What would fix it:** Say it of places: "Each place in a decimal is worth ten times the place to its right."

#### 2. query: "between any two decimals" needs "different"

- **Where:** `## The idea`, heading of the last paragraph: "**Between any two decimals there is another.**"
- **What is wrong:** As a "for every" claim it fails when the two decimals are equal: there is nothing strictly between $0.5$ and $0.50$, which the Note has just shown are the same number. The examples that follow are all of different decimals, so the meaning is clear in context. Not blocking.
- **What would fix it:** "Between any two different decimals there is another."

#### 3. query: distance from $0$ and the symbols $\leq$, $\geq$ beside the absolute value Node

- **Where:** `## The idea`, **Comparing two decimals.**: "because moving left takes you further from $0$"; `## Worked example`, Step 2: "Ignoring the signs, $0.80$ is further from $0$ than $0.35$"; and **Order.**: "The symbol $\leq$ means "less than or equal to", and $\geq$ means "greater than or equal to"."
- **What is wrong:** Nothing mathematically. Two things are worth a human's eye, since [[Absolute value, intervals, and inequalities]] is in Not taught before it. First, "ignoring the signs" and "further from $0$" are the informal idea of size without sign, which that Node teaches formally; here it is taught on the number line by this Note itself, which I judged sufficient, so I raise no `untaught` finding. Second, $\leq$ and $\geq$ are defined but never used anywhere in this Note, and may overlap with what the absolute value Node teaches as inequalities. Not blocking.
- **What would fix it:** None needed, unless the author prefers to drop the unused $\leq$ and $\geq$ sentence or leave them to [[Absolute value, intervals, and inequalities]].

All calculations were redone and are correct: $1.95$ and $1.995$ are the midpoints stated; the ordering $-0.8 < -0.35 < 0.072 < 0.65 < 0.7$ is right, as are the padded forms and the Step 5 positions; $0.65 < 0.7$, $0.4 < 0.45$, $-0.8 < -0.35$, and $2 - 1.999 = 0.001$ with $1.999 < 1.9995 < 2$. Each common mistake's counterexample breaks the wrong working. The decimal point and thin-space grouping match the **This Wiki** line of Conventions, and the Elsewhere forms are described as Conventions describes them. No contradiction with any Layer 0 sibling. As a Floor Node, nothing needs a source. The link to [[Left-hand and right-hand limits]] is marked as a skippable aside.

## Comments
