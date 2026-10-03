# Correctness review: Factors and multiples

**Status:** needs-triage

**Note:** [[Factors and multiples]] (`wiki/algebra/Factors and multiples.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

### Findings

#### 1. error: the negative factor pairs break the Note's own claims about factors and primes

- **Where:** `## The idea`, final paragraph: "Negative whole numbers have factor pairs too. A negative times a negative is positive, so $(-3) \times (-4) = 12$, and each factor pair of $12$ has a negative twin. A negative number such as $-12$ has pairs with one positive and one negative factor: $3 \times (-4)$ and $(-3) \times 4$ both give $-12$." Against, in the same section: "no factor of a number is bigger than the number", "So the factors of $12$ are $1, 2, 3, 4, 6, 12$", and "A number with exactly two factors, $1$ and itself, such as $7$, is a **prime**"; and in `## Common mistakes`: "A prime has exactly two factors, but $1$ has only one, itself."
- **What is wrong:** The Note defines a factor as "a whole number $a$" with $12 \div a$ a whole number, and its last paragraph counts negative numbers as whole numbers ("Negative whole numbers have factor pairs too") and calls $-3$ and $-4$ factors that multiply to $12$. Under the Note's own definition, then:
  - $3$ is a factor of $-12$, since $-12 \div 3 = -4$, but $3 > -12$. So "no factor of a number is bigger than the number" is false for the Note's own example $-12$.
  - $12 \div (-3) = -4$ is a whole number, so $-3$ is a factor of $12$, and the list "the factors of $12$ are $1, 2, 3, 4, 6, 12$" leaves out $-1, -2, -3, -4, -6, -12$. The same goes for the list of factors of $36$ in `## Worked example`.
  - $7$ has the four factors $-7, -1, 1, 7$, not "exactly two", so by the stated definition $7$ is not a prime. $1$ has two factors, $-1$ and $1$, so the common mistake's reason "$1$ has only one" is false, and by the stated definition $1$ would be a prime.
  
  These "never" and "exactly" claims hold only for positive factors, but the Note never says it counts positive factors only.
- **What would fix it:** Say once, before the factor lists, that "factor" means a positive factor unless the text says otherwise (for example, "In this Note, factors and multiples are positive whole numbers unless a minus sign is shown"). Then present the last paragraph as negative factor pairs, an extension the learner uses for sums such as $-7$, so that it does not change the lists, the bound on the size of a factor, or the definition of a prime. An alternative is to drop the word "whole" for negatives and call them "negative numbers" with "negative factor pairs".

## Comments
