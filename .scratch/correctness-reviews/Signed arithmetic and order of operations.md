# Correctness review: Signed arithmetic and order of operations

**Status:** needs-triage

**Note:** [[Signed arithmetic and order of operations]] (`wiki/algebra/Signed arithmetic and order of operations.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

### Findings

#### 1. error: the count-the-negatives rule fails when one of the numbers is 0

- **Where:** `## The idea`, under **Multiplying and dividing**: "With more than two numbers, count the negative signs. An even number of them gives a positive answer, and an odd number gives a negative one: $(-1) \times (-2) \times (-3) = -6$."
- **What is wrong:** The rule is stated for any numbers, but it breaks as soon as one of them is $0$. $(-1) \times (-2) \times 0$ has two negative signs, an even number, yet the answer is $0$, which is not positive. Likewise $(-1) \times 0 \times 5$ has one negative sign, an odd number, and the answer is $0$, not negative. The two-number rule above it does not have this problem, because $0$ has neither sign, so "same sign" and "different signs" never apply to it. The count rule has no such guard. The Worked example uses the rule correctly, since none of its numbers is $0$.
- **What would fix it:** Restrict the rule to non-zero numbers, for example "With more than two non-zero numbers, count the negative signs", and perhaps add that if any of the numbers is $0$, the answer is $0$.

#### 2. query: "the number directly before it" when the base is a bracket

- **Where:** `## The idea`, under **Indices and negative numbers**: "An index applies only to the number directly before it, called the *base*."
- **What is wrong:** In $(-3)^2$ what comes directly before the index is a closing bracket, not a number, and the base is the whole bracketed $-3$. The next sentence explains this, so nothing in the Note is wrong, but the first sentence reads as a rule the example then has to stretch. Not blocking.
- **What would fix it:** Something like "An index applies only to what comes directly before it, a single number or a whole bracket, called the *base*."

## Comments
