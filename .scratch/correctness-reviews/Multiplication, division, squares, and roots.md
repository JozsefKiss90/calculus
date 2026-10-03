# Correctness review: Multiplication, division, squares, and roots

**Status:** ready-for-human

**Note:** [[Multiplication, division, squares, and roots]] (`wiki/algebra/Multiplication, division, squares, and roots.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Every calculation was redone. In the first worked example, $4^2 = 16$, $3 \times 16 = 48$, $48 - 12 = 36$, $\sqrt{81} = 9$, $9 \div 3 = 3$ and $36 \div 3 = 12$, and each line of the expression-stepper matches. In the second, $(-6)^2 = 36$, $36 + 64 = 100$ and $\sqrt{100} = 10$. Each common mistake's counterexample breaks the wrong working: $-3^2 = -9$; $\sqrt{25} = 5 \neq 7$; $(3 + 4)^2 = 49 \neq 25$; $12 \div 2 \times 3 = 18$, where the wrong order gives $12 \div 6 = 2$; $5^2 = 25 \neq 10$; and $(-4) \times (-2) = 8$, checked by $8 \div (-2) = -4$. The sign rules, BIDMAS, *index* and *power* agree with `Conventions.md` and with the sibling [[Signed arithmetic and order of operations]]. This is a Floor Note, so no `unsourced` finding applies, and it uses nothing beyond 8th-grade mathematics.

### Findings

#### 1. query: the one-sentence summary does not exclude 0 when it says multiplication and division undo each other

- **Where:** `## In one sentence`: "Multiplication and division undo each other, squaring a number multiplies it by itself, and the square root of a number is the non-negative number whose square it is."
- **What is wrong:** As a general statement it does not hold for $0$. Multiplying by $0$ sends $5$ and $8$ to the same $0$, and dividing by $0$ has no answer, so multiplying by $0$ cannot be undone. The body of the Note does say "You can never divide by $0$", and its own example is the safe "dividing by $4$ undoes multiplying by $4$". So this is not a mathematical error in the working. But the sentence is copied into the `## Builds on` of [[Index laws and fractional powers]], where the qualification does not travel with it. The Layer sibling [[Inverse operations]] states the same fact with the restriction: "division undoes multiplication by a number other than $0$", and also "Multiplying by $0$ has no inverse." The Note also says "The square root reverses squaring" without saying it holds only for a number that is not negative, though the next sentences make this clear. A human may decide whether the two Notes read as consistent.
- **What would fix it:** For example, "Dividing by a number other than $0$ undoes multiplying by it, …".

## Comments
