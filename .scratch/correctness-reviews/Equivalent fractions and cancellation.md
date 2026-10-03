# Correctness review: Equivalent fractions and cancellation

**Status:** needs-triage

**Note:** [[Equivalent fractions and cancellation]] (`wiki/algebra/Equivalent fractions and cancellation.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

Every calculation was redone and is right: $\frac{2}{3} = \frac{8}{12}$, the factor lists of $18$ and $24$ and their HCF $6$, $\frac{18}{24} = \frac{9}{12} = \frac{3}{4}$ (prose and stepper), $\frac{6}{15} = \frac{8}{20} = \frac{2}{5}$, $\frac{5}{6} = \frac{20}{24}$. Each common mistake's counterexample breaks the wrong working: $\frac{2+3}{2+5} = \frac{5}{7} \neq \frac{3}{5}$; digit-cancelling $\frac{12}{24}$ gives $\frac{1}{4}$ but the value is $\frac{1}{2}$; $\frac{3}{12} = \frac{1}{4}$, which is a third of $\frac{3}{4}$; $\frac{2}{3} \approx 0.67 \neq 0.5$. As a Floor Note it may use Floor ideas (HCF, division by zero), and both are pointed to as marked asides. No Node from Not taught before it is used, only named. No `unsourced` finding applies to a Floor Note. Nothing contradicts a Layer sibling: the HCF here agrees with [[Factors and multiples]].

### Findings

#### 1. notation: a multiplication sign between letters

- **Where:** `## Worked example`, the closing general form: "In general, for any non-zero number $k$, $$\frac{a}{b} = \frac{a \times k}{b \times k}.$$"
- **What is wrong:** the notation authority's **Multiplication sign** entry says, on its This Wiki line: "$\times$ between numbers, $3 \times 4$; no sign between letters or a number and a letter, $3ab$." Here $a \times k$ and $b \times k$ put $\times$ between letters.
- **What would fix it:** write $\frac{a}{b} = \frac{ak}{bk}$.

#### 2. query: two paragraphs run together

- **Where:** `## The idea`, the line "You meet the HCF again, as an aside, in [[Factors and multiples]]." is followed directly, with no blank line, by "To check whether two fractions are equivalent, rewrite them over the same denominator, or put both in simplest form, and compare."
- **What is wrong:** without a blank line Markdown renders these as one paragraph, so the method for checking equivalence reads as part of the HCF aside the learner was told they may skip. Likewise there is no blank line between the last common mistake and `## Builds on`. Not mathematically wrong; a layout point for the author.
- **What would fix it:** add a blank line before "To check whether…" (and before `## Builds on`).

## Comments
