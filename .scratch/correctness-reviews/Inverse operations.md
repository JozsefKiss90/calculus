# Correctness review: Inverse operations

**Status:** ready-for-human

**Note:** [[Inverse operations]] (`wiki/algebra/Inverse operations.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Every calculation was redone with the Note's numbers: $19 - 4 = 15$, $15 \div 3 = 5$ and the forward check $5 \times 3 + 4 = 19$; $47 + 2 = 49$, $\sqrt{49} = 7$, $49 - 2 = 47$, and $(-7) \times (-7) = 49$; the wrong order $19 \div 3 = 6\frac{1}{3}$, $6\frac{1}{3} - 4 = 2\frac{1}{3}$, $2\frac{1}{3} \times 3 = 7$, $7 + 4 = 11 \neq 19$; $24 - 4 = 20$, $20 \times 4 = 80 \neq 24$; $5 \times 0 = 8 \times 0 = 0$. All correct, and each counterexample in `## Common mistakes` really breaks the wrong working. The Note is a Floor Node, so it may use the other Floor Nodes' ideas (square roots, division by zero), and no `unsourced` finding applies. Its links to [[Equations and rearranging formulas]] and [[Division restrictions]] name those Notes without using an idea that only an above-Floor Node teaches. The Note agrees with the written Layer siblings: like [[Multiplication, division, squares, and roots]], it says $\sqrt{\ }$ means the root that is not negative, and like [[Division restrictions]], it says division undoes multiplication and that division by $0$ has no value.

### Findings

#### 1. query: a "whatever that number was" claim that the squaring pair breaks

- **Where:** `## The idea`, "Doing an operation and then its inverse leaves you with the number you began with, whatever that number was.", followed by the list headed "The pairs you use are these:", which includes "**Squaring and taking the square root.**"
- **What is wrong:** read together, these say that squaring and then taking the square root gives back any starting number. It does not for negatives: $-3$ squared is $9$, and $\sqrt{9} = 3$. The Note qualifies this in the bullet ("This pair needs care with negative numbers"), in `## In one sentence` ("squaring a number that is positive or $0$") and in the second common mistake, so it is not stated as false outright. Still, the general sentence says "whatever that number was", and the list then gives a pair that does not meet it.
- **What would fix it:** qualify the square pair in the bullet itself, for example "Squaring and taking the square root, for a number that is positive or $0$." Or soften the general sentence so that it does not claim every listed pair works for every number.

#### 2. query: mixed numbers written next to a multiplication sign

- **Where:** `## Common mistakes`, "$2\frac{1}{3} \times 3 = 7$" (and $6\frac{1}{3}$, $2\frac{1}{3}$ in the same paragraph).
- **What is wrong:** nothing is wrong mathematically. But this Wiki writes a product without a sign wherever letters are involved, as in $3ab$, and in $2\frac{1}{3}$ the number $2$ sits next to a fraction with no sign between them. A learner could read that as $2 \times \frac{1}{3}$. `wiki/Conventions.md` has no entry for mixed numbers, so this is not a `notation` finding.
- **What would fix it:** write the values as improper fractions ($\frac{19}{3}$, $\frac{7}{3}$), or add a mixed-number entry to the notation authority.

## Review 2

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

The prose is unchanged since Review 1, and its calculations were redone and still hold. Both queries from Review 1 still apply to the text as it stands; they are not raised again here. This review covers what is new: the two `function-machine` blocks in `## Worked example`, checked against the Note and against the `function-machine` entry of `docs/archetype-catalogue.md`.

**First block.** `linear [3, 0]` is $3x$ and `linear [1, 4]` is $x + 4$, so the machines are "multiply by $3$" then "add $4$", in the order of the problem, with labels matching. From the input $5$: $5 \times 3 = 15$, then $15 + 4 = 19$, which is the Note's $19$. With `undo: reversed`, the chain undoes last step first: $19 - 4 = 15$, then $15 \div 3 = 5$. With `reversed-and-wrong`, the catalogue also undoes in the order the steps were done: $19 \div 3 = \frac{19}{3}$, then $\frac{19}{3} - 4 = \frac{7}{3}$, "2 and a third". Running that forwards gives $\frac{7}{3} \times 3 = 7$ and $7 + 4 = 11 \neq 19$. The caption agrees with every number, and with the first common mistake.

**Second block.** `quadratic [1, 0, 0]` is $x^2$ and `linear [1, -2]` is $x - 2$, so the machines are "square" then "subtract $2$". From $7$: $49$, then $47$, the Note's numbers. Undoing: $47 + 2 = 49$. The catalogue marks squaring as a machine that cannot be undone when the input might have been negative, and lists every input that gives its output, here $7$ and $-7$, since $(-7) \times (-7) = 49$. The caption, "7 and -7 both square to 49, so only the word positive tells you the start was 7", says exactly what the prose and the second common mistake say. So the widget does not contradict the prose's "$\sqrt{49} = 7$". It shows why the word *positive* is needed for that step.

Both blocks are valid instances. Each parameter is in the schema and in range: two machines, inputs $5$ and $7$, `undo` from its enum, `decimals: 0` in $[0, 6]$. The labels are KaTeX, and the captions are plain text with no markup. The idea of a chain of machines is composition, which [[Inputs, outputs, and composition]] teaches. That is another Floor Node, so this Floor Note may use it. Nothing in either block contradicts a written Layer sibling. In particular, the second block agrees with [[Inputs, outputs, and composition]] that squaring sends $3$ and $-3$ (here $7$ and $-7$) to one output.

### Findings

#### 1. query: rounded numbers passed along may stop the first block showing 11

- **Where:** `## Worked example`, the first `interactive` block: it leaves `decimals` at its default of `2`, and its caption says "Divide first and you reach 2 and a third, which runs forwards to 11, not 19."
- **What is wrong:** the catalogue defines `decimals` as "Decimal places for every number passed along". If a renderer rounds each value before passing it on, the wrong path goes $19 \div 3 \to 6.33$, then $6.33 - 4 = 2.33$, then $2.33 \times 3 = 6.99$, then $6.99 + 4 = 10.99$. The learner would see $10.99$ where the caption promises $11$. The mathematics in the caption is right ($\frac{7}{3} \times 3 + 4 = 11$). If rounding affects only the display, the block shows $11.00$ and there is nothing to fix. No `decimals` setting avoids the problem, because $\frac{19}{3}$ has no finite decimal. The second block has the same exposure in a smaller form. With `decimals: 0`, a learner who changes the input to $2.5$ would see $6.25$ shown as $6$, and the next machine would show $4.25$ as $4$.
- **What would fix it:** in the catalogue, say that `decimals` rounds only what is shown, and that exact values are passed between machines. Otherwise, reword the caption so it does not depend on an exact $11$ appearing on screen. This is a question about the Archetype's definition, not about the Note's mathematics.

## Review 3

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

The Note matches the Bundle's copy, and its prose and both `interactive` blocks are the same as in Review 2. Only `reviewed_by` was reset. The prose calculations were redone and still hold. The two queries from Review 1 still apply to the unchanged text; they are not raised again here. This review checks the two blocks against the updated `function-machine` entry of `docs/archetype-catalogue.md`. That entry now defines `decimals` as "Decimal places for every number shown. Rounding is for display only: each machine passes on the exact value, so rounding never changes a later output."

**Review 2's query is resolved.** Exact values are now passed between machines, so the first block's wrong path computes $19 \div 3 = \frac{19}{3}$, then $\frac{19}{3} - 4 = \frac{7}{3}$, then $\frac{7}{3} \times 3 = 7$, then $7 + 4 = 11$. At the default `decimals` of $2$ these show as $6.33$, $2.33$, $7.00$ and $11.00$. So the screen shows $11$, as the caption says, and not $10.99$. The correct path shows $19.00 \to 15.00 \to 5.00$, and the forward chain shows $5.00 \to 15.00 \to 19.00$. In the second block, from $7$: $49$, then $47$. Undone: $47 + 2 = 49$, and squaring is marked as a machine that cannot be undone, listing $7$ and $-7$. With `decimals: 0`, all of these are whole numbers and show exactly.

Both blocks are still valid against the updated entry. Every parameter is in the schema and in range, `decimals: 0` is in $[0, 6]$, and the rest is as Review 2 found it. The captions agree with every number the blocks now produce, and with the prose and the first two common mistakes.

### Findings

#### 1. query: rounded numbers on screen can look as if the arithmetic does not add up

- **Where:** `## Worked example`, both `interactive` blocks. In the first, the caption says "Divide first and you reach 2 and a third, which runs forwards to 11". In the second, `decimals: 0` is set.
- **What is wrong:** nothing is wrong mathematically, and the caption's $11$ is now what the screen shows. But because the rounding is now for display only, a learner who checks the shown numbers can see steps that look wrong. In the first block the wrong path shows $2.33$ going into "$\times 3$" and $7.00$ coming out, while $2.33 \times 3 = 6.99$. The caption's "2 and a third" explains this, and $\frac{7}{3}$ has no finite decimal, so no setting would avoid it. In the second block, a learner who changes the input to $2.5$ would see the input shown as a whole number, $2$ or $3$ depending on how $2.5$ is rounded, then $6.25$ shown as $6$ and $4.25$ shown as $4$. When undoing, the possible starts $\pm 2.5$ would also be shown rounded. This is the opposite of Review 2's question: the outputs are right, but the numbers shown between machines are not exact.
- **What would fix it:** nothing is needed in the Note for the numbers it chose. If the author wants learner-chosen inputs to show cleanly in the second block, they could drop `decimals: 0` (at the cost of $49.00$-style displays), or the catalogue could show a number with no more decimal places than it needs, up to `decimals`. Either is the author's call.

## Comments
