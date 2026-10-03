# 05: Archetype gap: number-line-moves

**Status:** ready-for-human

**Raised by:** the Interactive Author, for [[Signed arithmetic and order of operations]] (`wiki/algebra/Signed arithmetic and order of operations.md`)

## What the Note needs

A learner should see adding and subtracting signed numbers as moves along a number line: start at one number, then take a directed jump whose direction is set both by the sign of the number added or subtracted and by whether it is added or subtracted, and land on the answer. The passage it would sit beside, in `## The idea`:

> On the number line, negative numbers sit left of $0$ and positive numbers right of it. Adding a positive number moves you right; adding a negative number moves you left. So $5 + (-8)$ starts at $5$ and moves $8$ to the left, landing on $-3$.
>
> Subtracting does the opposite: subtracting a positive moves you left, and subtracting a negative moves you right. So taking away a negative is the same as adding a positive:
>
> $$4 - (-6) = 4 + 6 = 10.$$

and the common mistake in `## Common mistakes`:

> **Writing $7 - (-5) = 2$.** Subtracting a negative moves you right on the number line, not left: $7 - (-5) = 7 + 5 = 12$.

The point a learner most needs to see is that $4 - (-6)$ and $4 + 6$ are the same jump to the right, and that $7 - (-5)$ does not move left.

## Archetypes considered

- `number-line`: can mark the start and the answer as points, such as $5$ and $-3$, and its `distance` bracket can join them with the label $8$. But the bracket is an unsigned distance, the absolute value of the difference, so it shows no direction and no operation. It cannot show a move to the left as different from a move to the right, nor subtracting a negative as a move to the right, which is the whole idea.
- `expression-stepper`: can rewrite $4 - (-6)$ as $4 + 6$ and then $10$ (and is used in this Note for the BIDMAS worked example), but only as symbols. It does not show why the rewrite is true, which the Note explains as a direction on the number line.

## What a new Archetype would hold

- A number line with a chosen part shown.
- A starting number, marked.
- One or more moves taken in turn, each made of an operation (add or subtract) and a signed number, drawn as an arrow from where the last move ended, pointing right or left and labelled with what was added or subtracted.
- The landing point after each move, marked and labelled.
- Optionally, a second line or a switch that shows a subtraction of a negative beside the matching addition of a positive, so the learner sees the two arrows are the same.
- Optionally, the learner sets the start, the operation and the signed number, and watches the arrow and the landing point change.
- One line of caption saying what to notice.

## Comments

**Triage, 2026-10-03: accepted.** The Note teaches signed addition and subtraction as directed moves, and its commonest mistake is subtracting a negative. `number-line` cannot show either, because its bracket has no direction. The stepper the Note has shows only the rewriting of symbols. Build it as a new Archetype, not as a change to `number-line`, because the Builder appends and never edits. The side-by-side view of $a - (-b)$ and $a + b$ is the part that matters most, so make it more than an afterthought.

**Archetype Builder, 2026-10-03: built `number-line-moves`.** It is a new section at the end of `docs/archetype-catalogue.md`, with `number-line` left as written, and all three validations pass. Please look at four choices. (1) The comparison is `matching`, a second aligned number line beneath with the other operation and the number's sign flipped, so $a - (-b)$ sits above $a + b$ (and $a + (-b)$ above $a - b$). It defaults to `true`, so every instance shows it unless switched off, and `show-equation`, also on by default, writes the chain $4 - (-6) = 4 + 6 = 10$. Right and left arrows are drawn in two colours, the same on both lines. (2) An instance holds one move, not the "one or more moves" the gap asks for. A chain of moves needs each move to carry an operation and a signed number together, and the catalogue has no composite type for that (the existing ones are `function`, `piece`, `step` and `quantity`). Parallel lists of operations and amounts would need a Range term tying two lists to the same length, which the grammar also lacks. The Note's three cases, $5 + (-8)$, $4 - (-6)$ and $7 - (-5)$, are each one move, so I left chains out rather than change the grammar. If you want them, a `move` composite type is your decision. (3) I added `show-wrong-way`, off by default, which draws the struck-through arrow of the learner who moves by the operation alone and ignores the number's sign, such as $7 - (-5)$ going left to $2$. It is there for the Note's common mistake, and is in the spirit of `function-machine`'s `reversed-and-wrong`. Drop it if it is more than you want. (4) The grammar cannot require the landing point $start \pm amount$ to lie within `range`, so `amount`'s Meaning tells the Interactive Author to choose it so it does. `amount` may be $0$, which draws no arrow.
