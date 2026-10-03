# 03: Archetype gap: fraction-bar

**Status:** needs-triage

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
