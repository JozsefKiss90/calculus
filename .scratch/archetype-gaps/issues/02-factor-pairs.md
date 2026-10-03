# 02: Archetype gap: factor-pairs

**Status:** needs-triage

**Raised by:** the Interactive Author, for [[Factors and multiples]] (`wiki/algebra/Factors and multiples.md`)

## What the Note needs

A learner should watch a whole number's factors found by testing $1, 2, 3, \ldots$ in turn: each divisor that leaves no remainder produces a factor pair, a test that leaves a remainder produces none, and the search stops once the number tested, times itself, passes the number. It would sit beside this passage of `## The idea`:

> To list every factor, test $1, 2, 3, \ldots$ in turn; each one that divides exactly gives a pair. Stop once the number you test, times itself, is bigger than your number: every later pair is one you already have, reversed.

and the Worked example that carries it out for $36$: pairs $1 \times 36$, $2 \times 18$, $3 \times 12$, $4 \times 9$, $6 \times 6$ (written once), $36 \div 5 = 7.2$ rejected, and the stop at $7 \times 7 = 49$.

The same Note also wants two numbers' lists compared, with what they share picked out: the common factors of $24$ and $36$ with the highest, $12$, marked as the HCF, and the multiples of $4$ and $6$ side by side with the first shared one, $12$, marked as the LCM. An Archetype that finds a number's factors could reasonably show two numbers' factor or multiple lists together.

## Archetypes considered

- `expression-stepper`: can list the trial divisions one per line, but each line is a separate fact, not the same expression rewritten or an equation implied by the last, and it cannot show the pairs collecting, the rejected divisor, or the stopping rule as anything but text.
- `number-line`: can mark up to eight numbers, such as the multiples of $4$ and of $6$ up to $24$, but in one undifferentiated set. It cannot show which list each number came from, so the common multiple $12$ is not picked out, and it shows no factor pairs.
- `grid-plotter`: can plot the factor pairs of $12$ as points $(a, b)$ with $ab = 12$, but that is the curve $xy = 12$, a picture the Note never draws or mentions; it shows a neighbouring idea, not the listing method.
- `ratio-scaler`: scales two quantities together; nothing about divisibility or remainders.

## What a new Archetype would hold

- The number whose factors are listed, a positive whole number such as $36$.
- The divisor being tested, which the learner steps up from $1$; for each, the quotient and whether it is whole, and if so the factor pair it gives.
- The point where the search stops, when the divisor times itself first passes the number, with the square case ($6 \times 6$) written once.
- The finished list of factors, in order.
- Optionally a second number, so the two factor lists are shown together with their common factors and the highest marked; or the two numbers' multiples up to some bound, with the common multiples and the lowest marked.
- Optionally negative factor pairs, each positive pair beside its negative twin, as the Note's last paragraph of `## The idea` describes.

## Comments
