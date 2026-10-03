# 01: Archetype gap: function-machine

**Status:** needs-triage

**Raised by:** the Interactive Author, for [[Inverse operations]] (`wiki/algebra/Inverse operations.md`)

## What the Note needs

A learner should see a number pass forwards through a chain of operations, and then see the
chain run backwards, each operation replaced by its inverse and taken in reverse order, so
that the number they started with comes back out. The Note's central sentence is in
`## Undoing several steps`:

> To undo them, you undo the **last** step **first**, then work back through the steps in reverse order.

and its worked example is the chain it would sit beside, in `## Worked example`:

> $$\text{start} \xrightarrow{\ \times 3\ } \ ? \ \xrightarrow{\ +4\ } 19$$
>
> 1. The last step was "add $4$". Its inverse is "subtract $4$": $19 - 4 = 15$. [...]
> 2. The step before that was "multiply by $3$". Its inverse is "divide by $3$": $15 \div 3 = 5$.

The learner would set the starting number (or the output), watch $5 \to 15 \to 19$ forwards and
$19 \to 15 \to 5$ backwards, and try undoing in the wrong order to see that it fails, as the
first common mistake shows ($19 \div 3$ then subtract $4$ gives $2\frac{1}{3}$, which runs
forwards to $11$, not $19$). The Note's second example ($7$, square, subtract $2$, giving $47$)
and its square-root mistake ($3$ and $-3$ both squaring to $9$) would use the same picture.

## Archetypes considered

- `expression-stepper`: can list the lines $19 - 4 = 15$ and $15 \div 3 = 5$ with reasons, but
  only restates the Note's numbered working as text. It cannot show the forward chain beside
  the backward one, pair each operation with its inverse, or let the learner change the
  number or the order of undoing; it is built for one expression rewritten, not a chain of
  operations run both ways.
- `function-plot` and `transformation-explorer`: show functions as graphs on axes. The Note
  works with single numbers passed through named operations, with no graph and no variable.
- `number-line`: can mark $5$, $15$ and $19$, but cannot label the jumps between them as
  operations, and multiplying is not a jump along the line.

## What a new Archetype would hold

- A short chain of operations, in order, each one of add, subtract, multiply by, divide by,
  square or take the square root, with its number.
- A starting number the learner can change, with each intermediate result shown as it passes
  through the chain.
- The reversed chain beneath, each operation swapped for its inverse and the order reversed,
  run from the output back to the start.
- Optionally, letting the learner undo in the order the steps were done, so the wrong answer
  and its failed forwards check can be seen.
- A way to show where an operation cannot be undone: multiplying by $0$, or squaring when the
  start might be negative.
- A caption.

## Comments

**The Interactive Author, for [[Inputs, outputs, and composition]]** (`wiki/functions/Inputs, outputs, and composition.md`): the same machine picture, needed for composition. The Note's `## The idea` says:

> *Composition* is running one function after another. You put a number into the first machine, take what comes out, and put that into the second machine. The output of the second machine is the output of the whole chain.

> Order matters. Running the first machine then the second usually gives a different answer from running the second then the first, so whenever you compose, say which rule acts first.

Its `## Worked example` runs rule A, "add 3", and rule B, "square it", in both orders: with input 2, A then B gives 2, 5, 25 and B then A gives 2, 4, 7; with input -1 both orders give 4. For this Note the Archetype would also need a two-machine chain whose order the learner can swap, showing the final outputs of both orders side by side (25 against 7, or 4 and 4), and optionally a single machine with a table of inputs and outputs (the Note's table for "multiply by 2, then add 1": -1, 0, 1, 2, 3 give -1, 1, 3, 5, 7). Considered and rejected here: `function-plot` (draws $(x + 3)^2$ and $x^2 + 3$ as finished curves, but the Note uses no graphs and the intermediate output 5 or 4 never appears), `expression-stepper` (evaluates $(2 + 3)^2$ line by line, but cannot swap the order or take the learner's input), and `grid-plotter` (turns the table into points on a graph, which is another Note's idea).
