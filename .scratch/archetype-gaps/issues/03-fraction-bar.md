# 03: Archetype gap: fraction-bar

**Status:** ready-for-human

**Raised by:** the Interactive Author, for [[Equivalent fractions and cancellation]] (`wiki/algebra/Equivalent fractions and cancellation.md`)

## What the Note needs

A learner should see a bar cut into equal parts with some shaded, then see every part cut again, so the count of parts and of shaded parts both grow while the shaded amount stays exactly the same. The passage it would sit beside, in `## The idea`:

> Cut a bar into $3$ equal parts and shade $2$: you have shaded $\frac{2}{3}$. Now cut every part into $4$ smaller equal parts. The bar has $3 \times 4 = 12$ parts, and the shading covers $2 \times 4 = 8$ of them. You have shaded $\frac{8}{12}$, and the shaded amount has not changed.

The same picture would also show the Note's common mistake of changing only the denominator: $\frac{3}{12}$ shades a third of what $\frac{3}{4}$ does.

## Archetypes considered

- `ratio-scaler`: scales 2 and 3 together to 8 and 12 with a fixed ratio, but it shows two separate quantities on a double number line, not parts of one whole. Its slider is continuous, so it passes through non-whole numbers of parts and through 0 over 0, and its unit rate has no meaning for a fraction.
- `number-line`: can mark one point for both fractions, but its points are decimals, so $\frac{2}{3}$ becomes 0.6667 and the fractions themselves, and the parts, are never shown.
- `expression-stepper`: shows the arithmetic $\frac{2 \times 4}{3 \times 4}$ (and is used for the worked example), but not the shaded amount staying the same, which is why the arithmetic is true.

## What a new Archetype would hold

- A starting fraction: how many equal parts the whole is cut into, and how many are shaded.
- A whole-number splitting factor the learner changes, cutting every part into that many smaller parts, with the fraction written as it now reads (such as 8 over 12).
- Optionally a second bar beneath, for comparing two fractions, so a learner can see that two shadings cover the same length or do not.

## Comments

**Triage, 2026-10-03: accepted.** The Note already has an `expression-stepper`, so this is not for coverage. It is accepted because the shaded bar is the reason equivalent fractions are equal, and the stepper shows only the arithmetic. Later Notes on algebraic fractions are likely to want the same picture. Keep the splitting factor a positive whole number, so the bar never passes through a non-whole number of parts.

**Archetype Builder, 2026-10-03: `fraction-bar`.** Added as the last section of `docs/archetype-catalogue.md`, with two examples from [[Equivalent fractions and cancellation]]: 2 over 3 split into 12 parts with 8 shaded, and 3 over 4 above a fixed bar of 3 over 12 for the denominator-only mistake. All three validations pass. Per triage, `split` is an `integer` from 1, held `within split-range`, an `interval` in `[1, 12]` whose whole numbers are the only stops the slider makes, so the bar never has a non-whole number of parts and never 0 over 0. Three things to look at. First, the grammar has no Range term for "at most another parameter", so `check` cannot hold `shaded` to at most `parts`. Rather than leave such an instance meaningless, I made a shaded count above `parts` a fraction bigger than one, drawn as further whole bars end to end; if you would rather the Archetype show only proper fractions, that needs a new Range term (such as `at most p`). The same gap means `compare-shaded` can exceed `compare-parts`, treated the same way. Second, the second bar is fixed and does not split, which is what the common mistake needs; a second splitting factor for it was left out to keep the schema small. Third, the ranges (`parts` up to 12, `split` up to 12, so at most 144 parts, and `shaded` up to 24) are my guesses at what stays readable on one bar.
