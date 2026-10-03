# Correctness review: Signed arithmetic and order of operations

**Status:** needs-triage

**Note:** [[Signed arithmetic and order of operations]] (`wiki/algebra/Signed arithmetic and order of operations.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 2 blocking findings, so `reviewed_by` stays `none`.

### Findings

#### 1. error: the even/odd sign rule for a longer product fails when a factor is 0

- **Where:** `## The idea`, **Multiplying and dividing**: "With a longer product, count the negative factors. An even number of them gives a positive answer, and an odd number gives a negative one."
- **What is wrong:** The rule is stated for every longer product, but a product with a factor of $0$ is $0$, which is neither positive nor negative. $(-1) \times (-1) \times 0 = 0$ has an even number of negative factors (two) and is not positive; $(-2) \times 0 \times 3 = 0$ has an odd number (one) and is not negative. The two-number bullets above it are safe, because they speak of numbers "with the same sign" or "with different signs" and the Note says $0$ has no sign; this sentence counts negative factors and says nothing about the others, so it covers products containing $0$.
- **What would fix it:** Restrict the rule to products with no factor equal to $0$, for example "With a longer product of numbers other than $0$, count the negative factors. ..." or add "(If any factor is $0$, the product is $0$.)".

#### 2. untaught: the $1/2a$ convention uses a letter and implied multiplication

- **Where:** `## The idea`, **Other names you may meet**: "Some physics and engineering texts, and some calculators, also read $1/2a$ as $\frac{1}{2a}$, while a strict left-to-right reading gives $\frac{1}{2}a$. This Wiki never writes $\div$ or $/$ in front of a product without a sign, so you always see $\frac{1}{2a}$ or $\frac{1}{2}a$, whichever is meant."
- **What is wrong:** These two sentences rest on a letter standing for a number and on $2a$ meaning $2 \times a$, a product written without a sign. The Note teaches neither, and the sentences are not marked as an aside the learner can skip. Everything else in the Note works with numbers only.
- **Taught where:** Letters for numbers and products written without a sign are the subject of **Variables, substitution, and brackets** (and, for working with such expressions, **Expressions and operations**), both in this Note's **Not taught before it** list. Neither is a Floor Node, so rule 5 does not cover them.
- **What would fix it:** Either mark the two sentences as an aside the learner can skip, or move the implied-multiplication warning to the Note that introduces products without a sign (Variables, substitution, and brackets), where the Conventions entry "Implied multiplication after division" would first trip a learner up.

## Comments
