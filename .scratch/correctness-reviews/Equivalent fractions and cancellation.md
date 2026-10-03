# Correctness review: Equivalent fractions and cancellation

**Status:** ready-for-human

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

## Review 2

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

Both points from Review 1 are fixed. The general form now reads $\frac{a}{b} = \frac{ak}{bk}$, and blank lines now separate "To check whether…" from the HCF aside and the last common mistake from `## Builds on`. Every calculation was redone again and is right: $\frac{2}{3} = \frac{8}{12}$; the factors of $18$ and $24$ and their HCF, $6$; $\frac{18}{24} = \frac{9}{12} = \frac{3}{4}$, in the prose and in each stepper line; $\frac{6}{15} = \frac{8}{20} = \frac{2}{5}$; $\frac{5}{6} = \frac{20}{24}$; $\frac{16}{64} = \frac{1 \times 16}{4 \times 16}$; $\frac{12}{24} = \frac{1}{2}$; $\frac{3}{12} = \frac{1}{4}$, which is a third of $\frac{3}{4}$; $\frac{2}{3} \approx 0.67 \neq 0.5$. The Note uses Floor ideas (HCF, division by zero), which a Floor Note may use, and marks both links as asides. It names Nodes from Not taught before it but does not use their ideas. No `unsourced` finding applies to a Floor Note. Nothing contradicts a Layer sibling.

### Findings

#### 1. error: adding the same number to top and bottom does not always change the value

- **Where:** `## Common mistakes`, the fourth mistake: "Adding the same number to the numerator and the denominator changes the value. Only multiplying or dividing both by the same non-zero number keeps it."
- **What is wrong:** both sentences are stated without exception, and both are false. When the fraction equals $1$, adding the same number keeps its value: $\frac{3}{3} = \frac{3 + 1}{3 + 1} = \frac{4}{4} = 1$. Adding $0$ also keeps every value. So adding sometimes changes the value and sometimes does not, and multiplying or dividing is not the only move that keeps it. The counterexample itself, $\frac{1}{2} \neq \frac{2}{3}$, is right and does break the wrong working. Only the general rule drawn from it is too strong.
- **What would fix it:** weaken the claim, for example: "Adding the same number to the numerator and the denominator usually changes the value, so it is not a safe move. Multiplying or dividing both by the same non-zero number always keeps it."

## Review 3

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

The finding from Review 2 is fixed. The fourth common mistake now reads "Adding the same number to the numerator and the denominator usually changes the value. Multiplying or dividing both by the same non-zero number always keeps it." Both sentences are true. "Usually" allows for the exceptions ($\frac{3}{3} = \frac{4}{4}$, and adding $0$). Multiplying or dividing both by a non-zero $k$ multiplies the fraction by $\frac{k}{k} = 1$, so the value always stays the same. The counterexample $\frac{1}{2} = 0.5 \neq \frac{2}{3} \approx 0.67$ still breaks the wrong working.

I redid every calculation, and each is right: $\frac{2}{3} = \frac{2 \times 4}{3 \times 4} = \frac{8}{12}$, with $3 \times 4 = 12$ and $2 \times 4 = 8$; the factors of $18$ ($1, 2, 3, 6, 9, 18$) and of $24$ ($1, 2, 3, 4, 6, 8, 12, 24$), with HCF $6$; $\frac{18}{24} = \frac{3 \times 6}{4 \times 6} = \frac{3}{4}$; $\frac{18}{24} = \frac{9}{12} = \frac{3}{4}$ in the prose and in each stepper line ($9 \times 2 = 18$, $12 \times 2 = 24$, $3 \times 3 = 9$, $4 \times 3 = 12$); $\frac{6}{15} = \frac{8}{20} = \frac{2}{5}$; $\frac{5}{6} = \frac{20}{24}$; $\frac{2 + 3}{2 + 5} = \frac{5}{7} \neq \frac{3}{5}$, and $2$ is not a factor of $5$ or of $7$; $\frac{16}{64} = \frac{1 \times 16}{4 \times 16} = \frac{1}{4}$, while digit-cancelling $\frac{12}{24}$ gives $\frac{1}{4}$ against the true $\frac{1}{2}$; and $\frac{3}{12} = \frac{1}{4}$, which is a third of $\frac{3}{4}$. The general form $\frac{a}{b} = \frac{ak}{bk}$ for non-zero $k$ follows the Multiplication sign entry.

This is a Floor Note, so it may use Floor ideas such as the HCF and division by zero, and it marks both links as asides. It names Nodes from Not taught before it but does not use their ideas. No `unsourced` finding applies to a Floor Note. Nothing contradicts a Layer sibling. The HCF agrees with [[Factors and multiples]], "the denominator is never $0$" agrees with [[Division restrictions]], and the fraction as a division agrees with [[Multiplication, division, squares, and roots]].

### Findings

None.

## Comments
