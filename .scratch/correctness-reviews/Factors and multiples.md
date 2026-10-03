# Correctness review: Factors and multiples

**Status:** ready-for-human

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

## Review 2

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

Review 1's finding is cleared. The new opening sentence of `## The idea` ("In this Note, factors and multiples are positive whole numbers unless a minus sign is shown") makes the bound on the size of a factor, the lists of factors of $12$, $6$ and $36$, the definition of a prime and the reason $1$ is not prime all true, and the negative factor pairs paragraph now says it leaves the lists and the meaning of a prime as they are. Every calculation was redone and is right: the factors of $36$ and of $24$, the stop at $7 \times 7 = 49 > 36$, the common factors $1, 2, 4$ of $8$ and $12$, HCF $12$ of $24$ and $36$, LCM $12$ of $4$ and $6$, the pairs adding to $7$ and $-7$, and every counterexample in `## Common mistakes`. Nothing untaught is used (Floor Note; `## Why you need this` only names factorising as motivation and marks the later Note as skippable). No `unsourced` finding applies to a Floor Note. Nothing contradicts a Layer sibling: [[Equivalent fractions and cancellation]] uses HCF and "common factor" the same way. No notation departs from `Conventions.md`.

### Findings

#### 1. error: the closing general statement is wider than the Note's definition of a factor

- **Where:** `## Worked example`, last line: "In general, whenever $a \times b = n$ for whole numbers, $a$ and $b$ are factors of $n$, and $n$ is a multiple of each."
- **What is wrong:** The Note now defines a factor as a positive whole number $a$ of a positive whole number, and its own wording ("positive whole numbers") treats "whole numbers" as wider than the positive ones. The "whenever" claim only asks for whole numbers, so it covers cases the definition rules out:
  - $(-3) \times (-4) = 12$ with whole numbers $a = -3$, $b = -4$, so the claim makes $-3$ a factor of $12$. But the Note says the factors of $12$ are $1, 2, 3, 4, 6, 12$, and that negative pairs "leave the lists of factors ... as they are". No minus sign is shown in the statement itself, so the opening convention does not rescue it.
  - $0 \times 5 = 0$, so the claim makes $0$ a factor of $0$; but a factor must be positive, and $0 \div 0$ has no value.
- **What would fix it:** Write "for positive whole numbers" in place of "for whole numbers".

#### 2. query: the one-sentence summary's "multiple" is wider than the body's

- **Where:** `## In one sentence`: "a multiple of a whole number is that number times a whole number".
- **What is wrong:** Not wrong in standard mathematics, but read against the body it lets in $3 \times 0 = 0$ and $3 \times (-4) = -12$ as multiples of $3$, while `## The idea` lists the multiples of $3$ as $3, 6, 9, 12, 15, \ldots$ and says multiples are positive unless a minus sign is shown. This sentence is copied into the `## Builds on` of [[Common factors, quadratics, and difference of squares]], so a learner may meet it without the body's convention.
- **What would fix it:** Optionally say "positive whole number" in the summary, or leave it as is if the author judges the summary loose enough.

## Review 3

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Review 2's finding 1 is cleared: the closing statement of `## Worked example` now reads "whenever $a \times b = n$ for positive whole numbers", which matches the Note's definition and leaves out $(-3) \times (-4) = 12$ and $0 \times 5 = 0$. Review 2's query 2 is also resolved: `## In one sentence` now defines a factor and a multiple of a *positive* whole number in terms of positive whole numbers, which agrees with the body's convention.

Every calculation was redone and is right. These are the factor pairs of $12$, $24$ and $36$ and the lists built from them; $12 \div 5 = 2.4$ and $36 \div 5 = 7.2$; the stopping rule, where $6 \times 6 = 36$ is not bigger than $36$ and $7 \times 7 = 49$ is; the common factors $1, 2, 4$ of $8$ and $12$ with HCF $4$; the common multiples $12, 24, 36$ of $4$ and $6$ with LCM $12$; the HCF $12$ of $24$ and $36$, checked by $24 \div 12 = 2$ and $36 \div 12 = 3$; the pair sums $13, 8, 7$ and $(-3) + (-4) = -7$; and $3 \times (-4) = (-3) \times 4 = -12$. Each counterexample in `## Common mistakes` breaks the wrong working: $6 \div 12 = 0.5$; $12 = 1 \times 12$; $12 \div 4 = 3$ and $12 \div 6 = 2$ with $12 < 24$; $72$ is the LCM of $24$ and $36$ and is bigger than $24$; and $1$ has one factor.

Under the positive convention, the claims "no factor of a number is bigger than the number", "a common factor ... can be no bigger than the smaller number", "exactly two factors" and "the smallest prime is $2$" all hold. The stopping rule's claim that every later pair is one already found, reversed, is true.

Nothing untaught is used. This is a Floor Note, and signed multiplication and decimals are Floor material. *Factorising* appears only as motivation in `## Why you need this`, which also marks the later Note as skippable. No `unsourced` finding applies to a Floor Note. Nothing contradicts a written Layer sibling: [[Equivalent fractions and cancellation]] uses "common factor" and "highest common factor (HCF)" the same way, and [[Multiplication, division, squares, and roots]] and [[Signed arithmetic and order of operations]] give the same sign rule, $(-3) \times (-4) = 12$. No notation departs from `Conventions.md`: $\times$ is used between numbers, and the spelling is British.

### Findings

None.

## Comments
