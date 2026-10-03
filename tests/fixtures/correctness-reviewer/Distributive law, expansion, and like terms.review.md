# Correctness review: Distributive law, expansion, and like terms

**Status:** needs-triage

**Note:** [[Distributive law, expansion, and like terms]] (`wiki/algebra/Distributive law, expansion, and like terms.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 11 blocking findings, so `reviewed_by` stays `none`.

### Findings

#### 1. error: the definition of like terms ignores powers

- **Where:** `## The idea`: "**Like terms** are terms with exactly the same letters."
- **What is wrong:** Terms with the same letters but different powers are not like terms. By this definition $x^2$ and $2x$ are like terms, since each has exactly the letter $x$, yet the Note's own worked example keeps them apart: "$x^2 + 2x + 3x + 6 = x^2 + 5x + 6$". Collecting $x^2 + 2x$ by "adding their numbers" as the Note instructs gives $3x$ (or $3x^2$), which is wrong: at $x = 2$, $x^2 + 2x = 4 + 4 = 8$, while $3x = 6$ and $3x^2 = 12$.
- **What would fix it:** Define like terms as terms with the same letters raised to the same powers, and add $x^2$ and $x$ as a pair that are not like terms.

#### 2. untaught: the index law for multiplying powers

- **Where:** `## The idea`: "Where a letter multiplies itself, use the index law for multiplying powers, $x^m \times x^n = x^{m+n}$, so $x \times x = x^1 \times x^1 = x^2$."
- **What is wrong:** The Note uses the law $x^m \times x^n = x^{m+n}$, and the index $1$ ($x^1 = x$), without teaching either. The prerequisite only teaches that an index is worked before multiplication and that $(-3)^2 = (-3) \times (-3)$.
- **Taught where:** [[Index laws and fractional powers]] (and [[Powers and radicals]]), both listed in **Not taught before it**. The sentence is not marked as a skippable aside.
- **What would fix it:** Drop the index law and say $x \times x$ is written $x^2$, "$x$ squared", just as $3 \times 3 = 3^2$ in the prerequisite.

#### 3. untaught: letters standing for numbers, and substituting a value

- **Where:** throughout; for example `## The idea`: "$-2(x - 5) = -2x + 10$", and `## Worked example`: "Check it with $x = 2$: the start gives $2(10) - 3(1) = 17$".
- **What is wrong:** The Note works with letters as numbers ($x$, and $a, b, c$ in $a(b + c) = ab + ac$) and substitutes a value for a letter to check an answer, but never teaches what a letter in an expression means or how to substitute. Its own definition of like terms rests on "letters".
- **Taught where:** [[Variables, substitution, and brackets]], listed in **Not taught before it**; in the Anchor Graph it requires this Note, so it comes after it. This looks like a fault in the Anchor Graph: the Note cannot be taught without letters standing for numbers, and its only prerequisite, [[Signed arithmetic and order of operations]], uses no letters. For the author to triage.
- **What would fix it:** Either reverse or add the edge so that a Node teaching variables and substitution lies below this one, or have the Note teach, before first use, that a letter stands for a number and that substituting means replacing the letter by that number.

#### 4. notation: multiplication sign between a number and a letter, and between letters

- **Where:** `## The idea`: "$x^m \times x^n = x^{m+n}$, so $x \times x = x^1 \times x^1 = x^2$"; `## Worked example`: "$2 \times 3x$", "$-3 \times x + (-3) \times (-1)$", "$x \times x + x \times 2$", "$3 \times x + 3 \times 2$".
- **What is wrong:** The notation authority's **Multiplication sign** line reads "$\times$ between numbers, $3 \times 4$; no sign between letters or a number and a letter, $3ab$." These products put $\times$ between letters or between a number and a letter.
- **What would fix it:** Write the products without a sign, using brackets where the factors must stay visible, e.g. "$(x)(x) + 2x$", "$3(x) + 3 \times 2$", "$2(3x) + 2 \times 4$", "$(-3)(x) + (-3) \times (-1)$"; or say the step in words ("$x$ times $x$").

#### 5. unsourced: the distributive law

- **Where:** `## The idea`: "That is the **distributive law**: the number outside the bracket multiplies every term inside it. $$a(b + c) = ab + ac$$"
- **What is wrong:** A rule the Note teaches, in a non-Floor Note. The Bundle's Sources section says no source Note exists yet for the algebra domain, and `## References` is empty.
- **What would fix it:** A Source Curator curates an algebra reference covering the distributive law, and the Note cites it in `## References`.

#### 6. unsourced: the distributive law over subtraction

- **Where:** `## The idea`: "The law holds for subtraction too, because subtracting is adding the opposite"
- **What is wrong:** A general rule, $a(b - c) = ab - ac$, the Note teaches. No algebra source exists.
- **What would fix it:** Cite a curated algebra source that covers it.

#### 7. unsourced: the definition of expanding

- **Where:** `## The idea`: "Writing the bracket out this way is called **expanding** it."
- **What is wrong:** A definition the Note teaches. No algebra source exists.
- **What would fix it:** Cite a curated algebra source that covers it.

#### 8. unsourced: the definition of like terms

- **Where:** `## The idea`: "**Like terms** are terms with exactly the same letters."
- **What is wrong:** A definition the Note teaches (and see finding 1). No algebra source exists.
- **What would fix it:** Cite a curated algebra source that covers it, once the definition is corrected.

#### 9. unsourced: collecting like terms

- **Where:** `## The idea`: "You collect like terms by adding their numbers"
- **What is wrong:** A rule the Note teaches. No algebra source exists.
- **What would fix it:** Cite a curated algebra source that covers it.

#### 10. unsourced: expanding a product of two brackets

- **Where:** `## The idea`: "Two brackets multiplied together expand the same way, one term at a time. Each term of the first bracket multiplies the whole second bracket."
- **What is wrong:** A rule the Note teaches. No algebra source exists.
- **What would fix it:** Cite a curated algebra source that covers it.

#### 11. unsourced: the index law for multiplying powers

- **Where:** `## The idea`: "the index law for multiplying powers, $x^m \times x^n = x^{m+n}$"
- **What is wrong:** A rule the Note states as true and does not take from below (see finding 2). No algebra source exists.
- **What would fix it:** Remove it, as finding 2 suggests; otherwise cite a curated source that covers it.

## Comments
