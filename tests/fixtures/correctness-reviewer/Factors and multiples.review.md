# Correctness review: Factors and multiples

**Status:** ready-for-human

**Note:** [[Factors and multiples]] (`wiki/algebra/Factors and multiples.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Every calculation was redone: $12 \div 5 = 2$ remainder $2$; the factor pairs of $12$ ($1 \times 12$, $2 \times 6$, $3 \times 4$) and of $18$ ($1 \times 18$, $2 \times 9$, $3 \times 6$) are complete; the common factors $1, 2, 3, 6$ give highest common factor $6$; the multiples lists are right and $36$ is the first shared one, so the lowest common multiple is $36$; the check $36 \div 12 = 3$, $36 \div 18 = 2$ holds. In `## Common mistakes`, $24 = 12 \times 2$, and $216 = 12 \times 18$ is a common multiple ($216 \div 12 = 18$, $216 \div 18 = 12$) larger than $36$, so each counterexample breaks the wrong working. The "never" claim (a factor of $12$ is never bigger than $12$) holds for the positive whole numbers the Note restricts to. This is a Floor Note, so no `unsourced` finding applies; it uses no idea from Not taught before it (the mention of taking a common factor out of an expression is motivation that names a later idea, not a use of it); it agrees with its written Layer sibling; and its symbols ($\times$, $\div$) follow the notation authority.

### Findings

#### 1. query: "come in pairs" for a square number, and for 1

- **Where:** `## The idea`, "The factors of a number come in pairs that multiply to give it."
- **What is wrong:** Not wrong for $12$, but a learner applying it to a square number such as $9$ finds the pairs $1 \times 9$ and $3 \times 3$, where $3$ pairs with itself, so $9$ has an odd number of factors ($1, 3, 9$). Likewise $1 = 1 \times 1$ has one factor, which the Note itself relies on when it says $1$ is not prime. A learner told factors "come in pairs" may expect an even count, or list $3$ twice.
- **What would fix it:** Add that a factor can pair with itself, as $3 \times 3 = 9$, and is then listed once.

#### 2. query: a general claim justified by one example

- **Where:** `## The idea`, "Every number has $1$ and itself as factors, because $12 = 1 \times 12$."
- **What is wrong:** The claim is true, but the reason given is one instance. The general reason is that any number $n$ is $1 \times n$.
- **What would fix it:** "because any number is $1$ times itself, as $12 = 1 \times 12$."

## Comments
