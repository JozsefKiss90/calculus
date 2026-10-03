# 04: Archetype gap: substitution-evaluator

**Status:** wontfix

**Raised by:** the Interactive Author, for [[Division restrictions]] (`wiki/algebra/Division restrictions.md`)

## What the Note needs

A learner should choose a value of $x$, see it substituted into an expression with a letter in its denominator, and see the result: a number for every allowed value, and "undefined" with the denominator shown as $0$ at the excluded value. The Note's check in `## Worked example` is exactly this, done by hand at three values:

> So $x = 3$ is excluded, and you write $x \neq 3$. Check it by substituting $3$:
>
> $$\frac{3 + 1}{3 - 3} = \frac{4}{0}$$
>
> which is undefined. Every other value gives a number. At $x = 5$:
>
> $$\frac{5 + 1}{5 - 3} = \frac{6}{2} = 3$$
>
> At $x = -1$ the numerator is zero, and that is allowed:
>
> $$\frac{-1 + 1}{-1 - 3} = \frac{0}{-4} = 0$$

The same tool would show two of the Note's common mistakes: at $x = 4$, $\frac{x - 4}{x + 1}$ gives $\frac{0}{5} = 0$, a good value, so a zero numerator is no restriction; and $\frac{x - 3}{x - 3}$ gives $1$ at every value tried except $3$, where it gives $\frac{0}{0}$.

The Note is a Floor Node and assumes no graphs, so the substitution has to be shown as arithmetic, not as a curve.

## Archetypes considered

- `function-plot` (rational, with `trace`): the dragged point reads off input and output, but only on a graph, and near $3$ it shows the curve running off to a vertical asymptote. That is a picture of behaviour near the excluded value, which the Note never discusses, and it cannot show the substitution itself, $\frac{4}{0}$, or the numerator and denominator separately.
- `limit-table`: tabulates outputs as $x$ closes in on $3$ and says $f(3)$ is undefined, but its subject is approaching a value, a later idea. It cannot evaluate at chosen values such as $5$ and $-1$.
- `expression-stepper`: can write out one substitution as fixed lines (it is used for the Note's procedure of solving "denominator $= 0$"), but the learner cannot choose the value, so it cannot show that every value but one gives a number.

## What a new Archetype would hold

- An expression in one letter, as a fraction with a numerator and a denominator (a rational function from the closed families would do).
- A value of the letter the learner sets, by slider or by typing, possibly with a few starting values to try.
- What the learner watches: the expression with the value substituted, the numerator and denominator each worked out, and the result, either a number or the word "undefined" when the denominator is $0$.
- Optionally, the excluded values listed or marked, so the learner can find them and then try them.

## Comments

**Triage, 2026-10-03: not accepted.** *Division restrictions* already has an Interactive, and its hand check at three values reads well as prose. Above the Floor, choosing an input and reading its output is what `function-plot` with `trace` already does. `limit-table` already shows a value that is undefined. A third Archetype for evaluation would grow the closed set for one check in one Note. Two caveats. The passage quoted under "What the Note needs" is out of date: the Note no longer solves "denominator = 0", and works back from 0 by undoing operations. And substitution is an open question against the Anchor Graph: does *Variables, substitution, and brackets* teach it? If that is settled in a way that puts substitution on the Floor, and several Floor Notes ask for this, reopen it.
