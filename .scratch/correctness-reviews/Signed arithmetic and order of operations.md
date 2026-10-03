# Correctness review: Signed arithmetic and order of operations

**Status:** ready-for-human

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

## Review 2

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

Review 1's finding 1 is partly cleared: the count-the-negatives rule now applies only after any $0$ has been ruled out, and that part is correct. The new sentence that does the ruling out brings its own fault, below. Review 1's query 2 is cleared: the sentence now reads "An index applies only to what comes directly before it, a single number or a whole bracket, called the *base*." Every calculation in the Note was redone and is correct: the Worked example and its stepper ($-8$, $-12$, $-2$, $-6$), the BIDMAS examples ($7$ and $8$), and each wrong-then-right pair in `## Common mistakes` ($-9$, $9$, $12$, $12$, and the pattern $-12, -6, 0, 6, 12$). Nothing untaught, no contradiction with a Layer sibling, and the notation matches `Conventions.md` (BIDMAS, *index*, *brackets*, $\times$). No source is needed: this is a Floor Note.

### Findings

#### 1. error: "if any of the numbers is 0, the answer is 0" fails when the 0 is a divisor

- **Where:** `## The idea`, under **Multiplying and dividing**: "With more than two numbers, first look for a $0$: if any of the numbers is $0$, the answer is $0$."
- **What is wrong:** The paragraph sits under **Multiplying and dividing**, straight after a bullet that divides ($12 \div (-4) = -3$), and it says "any of the numbers", so it reads as covering chains of division too. It holds only when the $0$ is multiplied, or is the number being divided. With $0$ as a divisor the answer is not $0$: $12 \div 0 \times (-2)$ has no value, because dividing by $0$ has no answer (as the Floor sibling [[Division restrictions]] says: "dividing by zero is **undefined**: the division has no value, not even $0$"). Following the Note's rule, a learner writes $12 \div 0 \times (-2) = 0$. The count rule after it, "Otherwise, count the negative signs", is correct for division chains with no $0$ in them, for example $12 \div (-4) \div (-3) = 1$, two negatives, positive.
- **What would fix it:** Restrict the $0$ rule to multiplication, for example "if any number you multiply by is $0$, the answer is $0$", or add "you can never divide by $0$". Alternatively, say "With more than two numbers multiplied together" and leave division chains out of the paragraph.

## Review 3

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Review 2's finding 1 is cleared. The paragraph now reads: "With more than two numbers, first look for a $0$. If you divide by $0$ anywhere, there is no answer, because dividing by $0$ has no meaning. If you multiply by $0$, or $0$ is the first number, the answer is $0$. Otherwise, count the negative signs." In a chain of multiplications and divisions, a $0$ can only be the first number, a number multiplied by, or a divisor, so the three cases cover every chain. The divisor case is checked first, so $0 \div 0 \times 3$ correctly has no answer rather than $0$. Checks: $12 \div 0 \times (-2)$ has no answer; $0 \div 5 \times (-2) = 0$; $(-3) \times 0 \div 4 = 0$; $12 \div (-4) \div (-3) = 1$, two negatives, positive; $(-1) \times (-2) \times (-3) = -6$, three negatives, negative. "No meaning" agrees with the siblings [[Division restrictions]] ("dividing by zero is **undefined**") and [[Inverse operations]] ("dividing by $0$ has no meaning").

Every calculation was redone and is correct: $5 + (-8) = -3$, $4 - (-6) = 10$, $(-3) \times (-4) = 12$, $(-3) \times 4 = -12$, $12 \div (-4) = -3$, $8 - 3 + 2 = 7$ (wrong reading $3$), $12 \div 3 \times 2 = 8$ (wrong reading $2$), $(-3)^2 = 9$, $-3^2 = -9$. The Worked example and its stepper: $5 - 8 = -3$, $(-2)^3 = -8$, $4 \times (-3) = -12$, $-12 \div 6 = -2$, $-8 - (-2) = -6$. Each common mistake's wrong working gives the stated wrong answer ($10 - 7 = 3$, $24 \div 8 = 3$, $7 - 5 = 2$) and its correction is right ($9$, $12$, $12$, and the pattern $-12, -6, 0, 6, 12$). Nothing untaught: this is a Floor Note, later Nodes are only named, and the slope remark is marked as an aside. No contradiction with a Layer sibling: the $-3^2$ reading and the left-to-right rule match [[Multiplication, division, squares, and roots]]. Notation matches `Conventions.md` (BIDMAS and the other mnemonics as listed there, *index*, *brackets*, $\times$). No source is needed: this is a Floor Note.

### Findings

None.

## Comments
