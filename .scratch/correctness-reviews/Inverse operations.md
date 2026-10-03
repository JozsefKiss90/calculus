# Correctness review: Inverse operations

**Status:** ready-for-human

**Note:** [[Inverse operations]] (`wiki/algebra/Inverse operations.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Every calculation was redone with the Note's numbers: $19 - 4 = 15$, $15 \div 3 = 5$ and the forward check $5 \times 3 + 4 = 19$; $47 + 2 = 49$, $\sqrt{49} = 7$, $49 - 2 = 47$, and $(-7) \times (-7) = 49$; the wrong order $19 \div 3 = 6\frac{1}{3}$, $6\frac{1}{3} - 4 = 2\frac{1}{3}$, $2\frac{1}{3} \times 3 = 7$, $7 + 4 = 11 \neq 19$; $24 - 4 = 20$, $20 \times 4 = 80 \neq 24$; $5 \times 0 = 8 \times 0 = 0$. All correct, and each counterexample in `## Common mistakes` really breaks the wrong working. The Note is a Floor Node, so it may use the other Floor Nodes' ideas (square roots, division by zero), and no `unsourced` finding applies. Its links to [[Equations and rearranging formulas]] and [[Division restrictions]] name those Notes without using an idea that only an above-Floor Node teaches. The Note agrees with the written Layer siblings: like [[Multiplication, division, squares, and roots]], it says $\sqrt{\ }$ means the root that is not negative, and like [[Division restrictions]], it says division undoes multiplication and that division by $0$ has no value.

### Findings

#### 1. query: a "whatever that number was" claim that the squaring pair breaks

- **Where:** `## The idea`, "Doing an operation and then its inverse leaves you with the number you began with, whatever that number was.", followed by the list headed "The pairs you use are these:", which includes "**Squaring and taking the square root.**"
- **What is wrong:** read together, these say that squaring and then taking the square root gives back any starting number. It does not for negatives: $-3$ squared is $9$, and $\sqrt{9} = 3$. The Note qualifies this in the bullet ("This pair needs care with negative numbers"), in `## In one sentence` ("squaring a number that is positive or $0$") and in the second common mistake, so it is not stated as false outright. Still, the general sentence says "whatever that number was", and the list then gives a pair that does not meet it.
- **What would fix it:** qualify the square pair in the bullet itself, for example "Squaring and taking the square root, for a number that is positive or $0$." Or soften the general sentence so that it does not claim every listed pair works for every number.

#### 2. query: mixed numbers written next to a multiplication sign

- **Where:** `## Common mistakes`, "$2\frac{1}{3} \times 3 = 7$" (and $6\frac{1}{3}$, $2\frac{1}{3}$ in the same paragraph).
- **What is wrong:** nothing is wrong mathematically. But this Wiki writes a product without a sign wherever letters are involved, as in $3ab$, and in $2\frac{1}{3}$ the number $2$ sits next to a fraction with no sign between them. A learner could read that as $2 \times \frac{1}{3}$. `wiki/Conventions.md` has no entry for mixed numbers, so this is not a `notation` finding.
- **What would fix it:** write the values as improper fractions ($\frac{19}{3}$, $\frac{7}{3}$), or add a mixed-number entry to the notation authority.

## Comments
