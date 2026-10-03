# Correctness review: Coordinates, tables, and plotting

**Status:** ready-for-human

**Note:** [[Coordinates, tables, and plotting]] (`wiki/functions/Coordinates, tables, and plotting.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

### Findings

#### 1. error: "any other rule" gets a smooth curve, stated as a general rule

- **Where:** `## The idea`: "For a straight-line rule, use a ruler. For any other rule, draw a smooth curve through the points, not straight segments from dot to dot." The same claim is repeated in `## Common mistakes`: "Draw a smooth curve unless the rule is a straight line."
- **What is wrong:** The claim is stated for every rule that is not a straight line, and it is false for some of them. Take $y = |x|$ with the table $x = -1, 0, 1$ and $y = 1, 0, 1$. Its graph is two straight segments meeting at a sharp corner at $(0, 0)$. A smooth curve through the three points rounds the corner off, and at $x = 0.5$ it does not pass through $(0.5, 0.5)$. A rule that has no value at some $x$ breaks it too. For $y = \frac{1}{x}$ with the table $x = -1, 1$ and $y = -1, 1$, one curve joining $(-1, -1)$ to $(1, 1)$ "in order of $x$" passes through $x = 0$, where the rule has no value. Every other calculation in the Note is correct. I redid all five table values, $1.4^2 - 2 = -0.04$, the segment point $(0.5, -1.5)$ against the rule's $-1.75$, and the counterexamples in the first, second and fourth mistakes.
- **What would fix it:** Narrow the claim to what the Note shows. For example: "For a curved rule such as $y = x^2 - 2$, draw a smooth curve through the points, not straight segments from dot to dot." Make the matching change to the last sentence of the third common mistake.

#### 2. query: "a V with a sharp corner at $(0, -2)$"

- **Where:** `## Common mistakes`, third mistake: "Straight segments give a V with a sharp corner at $(0, -2)$."
- **What is wrong:** This is not strictly a mathematical error. The five-point polyline has corners at $(-1, -1)$, $(0, -2)$ and $(1, -1)$, and its segment slopes are $-3, -1, 1, 3$, so it is not a V with a single corner. A learner who draws it may see three corners and be confused.
- **What would fix it:** Optional. For example: "Straight segments give a shape with sharp corners, the sharpest-looking at $(0, -2)$." Or drop the V and keep the $x = 0.5$ check, which carries the point.

#### 3. query: $(x, y)$ as a point and $(a, b)$ as an interval

- **Where:** `## The idea`: "Any point on the grid is named by two numbers written in brackets, $(x, y)$".
- **What is wrong:** Nothing yet. The Conventions entry *Intervals* says "The same $(a, b)$ also names the point with coordinates $a$ and $b$; say which." This Note introduces the point reading. Intervals are taught later, in [[Absolute value, intervals, and inequalities]], so that later Note is the natural place to warn about the clash. Flagged so the author can confirm that it does.
- **What would fix it:** No change needed here, unless the author wants a skippable aside.

## Review 2

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Review 1's error is cleared. `## The idea` now says "For a curved rule such as $y = x^2 - 2$, draw a smooth curve through the points". It also adds a hedge for rules with a sharp corner or a gap. The third common mistake no longer claims a single V. I redid every calculation: the five table values $2, -1, -2, -1, 2$; $1.4^2 - 2 = 1.96 - 2 = -0.04$, with the true crossing near $1.414$, between $1$ and $2$; the rule's $0.5^2 - 2 = -1.75$ against the segment midpoint $(0.5, -1.5)$; $(-2) \times (-2) = 4$; and the counterexamples in the first and fourth mistakes. With the axis labelled the wrong way, the mark $1$ left of the origin reads $-3$. So $(-3, 0)$ lands where $(-1, 0)$ belongs. All are correct. This is a Floor Note, so no `unsourced` finding applies, and every idea it uses is 8th-grade mathematics. It agrees with its Layer siblings: the number line in [[Decimals, ordering, and number lines]] and the input–output table in [[Inputs, outputs, and composition]]. It also agrees with Conventions: *brackets* for $( \, )$, and $\times$ between numbers.

### Findings

#### 1. query: "sharp corners at the plotted points"

- **Where:** `## Common mistakes`, third mistake: "Straight segments give a shape with sharp corners at the plotted points."
- **What is wrong:** This is not strictly an error. The straight-line shape has corners only at the three inner points, $(-1, -1)$, $(0, -2)$ and $(1, -1)$. The end points $(-2, 2)$ and $(2, 2)$ are not corners. A careful learner may notice that.
- **What would fix it:** Optional. For example: "sharp corners at the inner plotted points", or "sharp corners at $(-1, -1)$, $(0, -2)$ and $(1, -1)$".

## Comments
