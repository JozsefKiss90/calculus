# Archetype catalogue

Every Interactive in the Wiki is an instance of one Archetype in this catalogue, written as a
fenced `interactive` block of YAML that names the Archetype and fills in its parameters
([ADR-0004](adr/0004-interactives-are-archetype-instances.md)). This file is the authority
for which Archetypes exist and what each one accepts. Three readers use it:

- **Note Author** — reads only each Archetype's name and **One-liner**, which go into a
  Context Pack unchanged, to mark where an Interactive belongs.
- **Interactive Author** — reads the full parameter schemas to write a valid instance.
- **`check`** — validates every `interactive` block against these schemas (invariant 9). An
  unknown Archetype, a missing required parameter, an unknown parameter, a wrong type or an
  out-of-range value fails the build.

A schema says *what* is shown, never *how*. Nothing here names a rendering library, and no
parameter holds code or an expression to be evaluated. A function is chosen from a closed list
of families by its coefficients, not written as a formula. How each Archetype is drawn is the
App's business, so the renderer can be chosen and replaced without touching a Note.

## A closed set

This catalogue is a closed set. An Interactive can only be an instance of an Archetype listed
here, and no agent invents a one-off visualisation. When the material needs something no
Archetype covers, the Interactive Author reports the gap instead of forcing the nearest fit.
The gap is then handed to the **Archetype Builder**, which writes one new Archetype in exactly
the shape below. It joins the catalogue only after a human has reviewed it. That is the only
way the set grows. A new composite type or function family is added the same way.

## Reading a schema

Each Archetype has a **One-liner**, a **Serves** line naming the ideas it is for, a parameter
table and at least one worked example taken from a Note that needs it. Every parameter table
has the same six columns:

- **Parameter** (or **Field**, in a composite type) — the name written in the YAML.
- **Type** — one of the types below, `enum(a, b, …)` for a closed choice of words, or
  `list of <type>`.
- **Required** — `yes` or `no`.
- **Default** — `—` if the parameter is required. For an optional parameter, the value it
  takes when it is left out. `none` means the feature it controls is not shown.
- **Range** — `—` for no constraint, otherwise one or more terms joined by `; `:
  - `[a, b]` — every number in the value lies from `a` to `b` inclusive. For a point, pair,
    interval or list, that means every number inside it.
  - `excluding v` — the number `v` is not allowed.
  - `[a, b] items` — a list has from `a` to `b` items.
  - `within p` — the number lies inside the interval held by parameter `p`.
  - `differs from p` — the value is not equal to parameter `p`'s value.
  - `needs p` — the parameter may be given only if parameter `p` is given too.
  - `only when p is v` — the parameter may be given only if parameter `p` has the value `v`.
- **Meaning** — what the parameter controls, for the person writing the instance.

Parameter names are lower-case and hyphenated. Every default satisfies its own range. Where a
parameter's Range names another parameter (`within`, `differs from`, `needs`, `only when`), it
means a parameter of the same Archetype, or a field of the same composite value.

An Archetype may have no required parameter. Then a bare instance, naming only the
Archetype, is valid and shows the empty starting state: a blank number line, or a grid to
place points on.

## Types

| Type | A value is |
|---|---|
| `number` | A finite decimal written out in full: `2`, `-0.5`, `0.001`. It cannot be a fraction, `pi` or an expression. Angles are in degrees unless the Meaning says radians. |
| `integer` | A whole number: `3`, `-2`. |
| `boolean` | `true` or `false`. |
| `text` | One line of plain words for a learner to read, in British English, with no LaTeX and no markup. |
| `latex` | Mathematics in the Wiki's LaTeX subset ([ADR-0006](adr/0006-latex-is-restricted-to-the-katex-subset.md)), without dollar signs and single-quoted so a backslash stays a backslash: `'\frac{1}{x}'`. Checked like every other expression in a Note. |
| `point` | Two numbers `[x, y]`: a position on the plane. |
| `pair` | Two numbers `[a, b]` that are not a position, such as two values on one line or two factors. The Meaning says which is which. |
| `interval` | Two numbers `[min, max]`, with `min` below `max`: the part of an axis that is shown, or the stretch a slider moves through. |
| `span` | An interval as the mathematics writes it, in the interval notation of `wiki/Conventions.md`, single-quoted: `'[-2, 3)'`, `'(1, inf)'`. `-inf` and `inf` may only stand at an open end. |

### Composite types

A composite value is a YAML mapping whose fields are typed in the same way as parameters.

#### `function`

One function, chosen from a closed list of families by its coefficients.

| Field | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `family` | `enum(linear, quadratic, polynomial, rational, absolute, square-root, sine, cosine, tangent)` | yes | — | — | Which kind of function it is. This fixes how many coefficients there are and what each means. |
| `coefficients` | `list of number` | yes | — | `[1, 6] items; [-1000, 1000]` | The numbers that pick one member of the family, in the order the family table gives. Exactly as many as the family's Coefficients column says. |
| `denominator` | `list of number` | no | `none` | `[1, 6] items; [-1000, 1000]; only when family is rational` | The denominator's coefficients, highest power first. A `rational` function needs it. |
| `label` | `latex` | no | `none` | — | How the function is written beside its curve. If absent, it is written from the family and coefficients. |

| Family | Coefficients | Means |
|---|---|---|
| `linear` | 2 | $[m, c]$ is $mx + c$ |
| `quadratic` | 3 | $[a, b, c]$ is $ax^2 + bx + c$ |
| `polynomial` | 1–6 | $[a_n, \dots, a_0]$ is $a_n x^n + \dots + a_1 x + a_0$, highest power first |
| `rational` | 1–6 | numerator $[p_n, \dots, p_0]$ over `denominator` $[q_m, \dots, q_0]$ is $\frac{p_n x^n + \dots + p_0}{q_m x^m + \dots + q_0}$ |
| `absolute` | 3 | $[a, h, k]$ is $a \lvert x - h \rvert + k$ |
| `square-root` | 3 | $[a, h, k]$ is $a \sqrt{x - h} + k$ |
| `sine` | 4 | $[A, B, C, D]$ is $A \sin\big(B(x - C)\big) + D$, with $x$ in radians |
| `cosine` | 4 | $[A, B, C, D]$ is $A \cos\big(B(x - C)\big) + D$, with $x$ in radians |
| `tangent` | 4 | $[A, B, C, D]$ is $A \tan\big(B(x - C)\big) + D$, with $x$ in radians |

A function is drawn only where it is defined. A rational function whose numerator and
denominator share a zero is drawn with an open dot at that input, not with a gap or an asymptote.

#### `piece`

One piece of a piecewise function.

| Field | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `function` | `function` | yes | — | — | The rule on this piece. |
| `on` | `span` | yes | — | — | Where the rule applies. Each end is open or closed as the span writes it, and drawn as an open or filled dot. |

#### `step`

One line of an algebraic working.

| Field | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `latex` | `latex` | yes | — | — | The expression or equation as it stands after this step. |
| `because` | `text` | no | `none` | — | Why this line follows from the one before. The first line has no reason. |

#### `quantity`

One measured amount.

| Field | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `label` | `text` | yes | — | — | What is measured, such as distance or flour. |
| `value` | `number` | yes | — | `[0.000001, 1000000]` | How much of it there is. |
| `unit` | `text` | no | `none` | — | Its unit, such as km. Leave it out for a count or a pure ratio. |

## Archetypes

### `function-plot`

**One-liner:** Plots up to four functions on shared axes, with an optional point you drag along a curve to read its output.

**Serves:** function families, domain and range, plotting.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `functions` | `list of function` | yes | — | `[1, 4] items` | The curves, drawn in this order, each in its own colour with its label. |
| `x-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the x-axis shown. |
| `y-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the y-axis shown. |
| `x-axis` | `enum(numbers, multiples-of-pi)` | no | `numbers` | — | How the x-axis ticks are labelled. Use `multiples-of-pi` for a trigonometric graph. |
| `points` | `list of point` | no | `[]` | `[0, 6] items; [-1000, 1000]` | Fixed points, each marked and labelled with its coordinates. |
| `trace` | `boolean` | no | `false` | — | Adds a point you drag along the first function, labelled with its input and output. |
| `show-domain` | `boolean` | no | `false` | — | Shades, along the x-axis, the inputs where the first function is defined. |
| `show-range` | `boolean` | no | `false` | — | Shades, along the y-axis, the outputs the first function takes within the part shown. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Linear, quadratic, polynomial, and rational functions]]: the four families side by side, so the shapes can be told apart before any is studied alone.

```interactive
archetype: function-plot
functions:
  - family: linear
    coefficients: [2, -1]
  - family: quadratic
    coefficients: [1, 0, -4]
  - family: polynomial
    coefficients: [1, 0, -3, 0]
  - family: rational
    coefficients: [1]
    denominator: [1, 0]
x-range: [-5, 5]
y-range: [-6, 6]
caption: A straight line, a parabola, a cubic with two turns, and a curve that never touches the y-axis.
```

**Example** — [[Function notation, domain, and range]]: the domain is the set of inputs at which the point can be dragged, and the range is the set of heights it reaches.

```interactive
archetype: function-plot
functions:
  - family: square-root
    coefficients: [1, 2, 0]
    label: 'f(x) = \sqrt{x - 2}'
x-range: [-2, 10]
y-range: [-2, 4]
trace: true
show-domain: true
show-range: true
caption: Drag the point to the left. It stops at 2, because no input below 2 has an output.
```

### `secant-to-tangent`

**One-liner:** Draws the secant through two points on a curve and slides the second point in until the secant becomes the tangent.

**Serves:** the difference quotient, average rate of change, the derivative.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `function` | `function` | yes | — | — | The curve. |
| `at` | `number` | yes | — | `within x-range` | The fixed input $a$. The first point is $(a, f(a))$. |
| `h` | `number` | no | `1` | `[-10, 10]; excluding 0` | The starting gap between the inputs. The second point is $(a + h, f(a + h))$. |
| `smallest-h` | `number` | no | `0.001` | `[0.000001, 1]` | How close to zero the slider lets $h$ come. It never reaches zero. |
| `show-rise-run` | `boolean` | no | `true` | — | Draws the run $h$ and the rise $f(a + h) - f(a)$ as the sides of a triangle under the secant. |
| `show-quotient` | `boolean` | no | `true` | — | Shows the difference quotient with the current numbers substituted, and its value, as $h$ changes. |
| `show-tangent` | `boolean` | no | `false` | — | Draws the tangent at $a$, the line the secant approaches. |
| `x-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the x-axis shown. |
| `y-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the y-axis shown. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Difference quotient]]: the quotient for $x^2$ at $1$ is $2 + h$, and you can watch it fall towards 2 as the gap closes.

```interactive
archetype: secant-to-tangent
function:
  family: quadratic
  coefficients: [1, 0, 0]
at: 1
h: 2
x-range: [-1, 4]
y-range: [-1, 10]
caption: Shrink h and watch the quotient settle towards 2. It never has to divide by zero.
```

**Example** — [[Derivative]]: the tangent is shown from the start, so the secant visibly turns into it.

```interactive
archetype: secant-to-tangent
function:
  family: polynomial
  coefficients: [1, 0, -3, 0]
at: -0.5
h: 1.5
show-tangent: true
x-range: [-3, 3]
y-range: [-4, 4]
caption: As h shrinks, the secant swings onto the tangent, and its slope becomes the derivative.
```

### `unit-circle`

**One-liner:** A point you drag round the unit circle, showing its angle in degrees and radians and its coordinates as cosine and sine.

**Serves:** the unit circle and radians, quadrants and signs, special angles.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `angle` | `number` | yes | — | `[-720, 720]` | The starting angle in degrees, measured anticlockwise from the positive x-axis. |
| `angle-display` | `enum(degrees, radians, both)` | no | `both` | — | How the angle is written. Radians are written as multiples of pi wherever the angle is special. |
| `draggable` | `boolean` | no | `true` | — | Whether the point can be dragged. |
| `snap` | `enum(none, special-angles, multiples-of-15)` | no | `none` | — | Where a dragged point settles. |
| `show-coordinates` | `boolean` | no | `true` | — | Labels the point with its coordinates as cosine and sine of the angle, with their values. |
| `show-tangent` | `boolean` | no | `false` | — | Draws the tangent of the angle as a length on the line $x = 1$. |
| `show-reference-angle` | `boolean` | no | `false` | — | Marks the acute angle the radius makes with the x-axis. |
| `show-quadrant-signs` | `boolean` | no | `false` | — | Writes in each quadrant the signs of sine, cosine and tangent there. |
| `show-arc` | `boolean` | no | `false` | — | Highlights the arc from the positive x-axis to the point and labels its length, which equals the angle in radians. |
| `decimals` | `integer` | no | `3` | `[0, 6]` | Decimal places for the coordinates and the arc length. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Unit circle and radians]]: on a circle of radius 1, the arc length is the angle in radians.

```interactive
archetype: unit-circle
angle: 60
show-arc: true
caption: The arc is as long as the angle is in radians. One full turn is about 6.283.
```

**Example** — [[Special-angle values]]: the point snaps to the special angles, so the exact values can be read off.

```interactive
archetype: unit-circle
angle: 45
snap: special-angles
angle-display: both
caption: At 30, 45 and 60 degrees the coordinates are the exact values worth knowing by heart.
```

**Example** — [[Quadrants, signs, and reference angles]]: an angle in the second quadrant has the same reference angle as 30 degrees, but its cosine is negative.

```interactive
archetype: unit-circle
angle: 150
show-reference-angle: true
show-quadrant-signs: true
caption: 150 degrees has reference angle 30 degrees. Same sizes, but cosine is negative here.
```

### `right-triangle`

**One-liner:** A right-angled triangle you reshape by angle and size, labelling its sides by role or length and showing their ratios.

**Serves:** right-triangle trigonometry, similar triangles, Pythagoras' theorem.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `angle` | `number` | yes | — | `[1, 89]` | The marked acute angle, in degrees. |
| `hypotenuse` | `number` | no | `5` | `[0.1, 1000]` | The starting length of the hypotenuse. |
| `drag` | `enum(angle, size, both, none)` | no | `both` | — | What the learner may change. |
| `side-labels` | `enum(roles, lengths, both, none)` | no | `both` | — | Roles name the sides as opposite, adjacent and hypotenuse relative to the marked angle. |
| `show-ratios` | `boolean` | no | `false` | — | Shows sine, cosine and tangent of the marked angle as one side over another, with their values. |
| `show-squares` | `boolean` | no | `false` | — | Draws the square on each side, labelled with its area. |
| `similar-scale` | `number` | no | `none` | `[0.1, 10]; excluding 1` | Draws a similar copy scaled by this factor, with matching sides marked alike. |
| `decimals` | `integer` | no | `2` | `[0, 6]` | Decimal places for lengths, areas and ratios. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Similar triangles and Pythagoras' theorem]]: the 3, 4, 5 triangle and a copy twice its size, with squares to show that the areas add up.

```interactive
archetype: right-triangle
angle: 36.87
hypotenuse: 5
side-labels: lengths
show-squares: true
similar-scale: 2
caption: 9 plus 16 is 25 for the small triangle. Doubling every side keeps the angles the same.
```

**Example** — [[Sine, cosine, and tangent ratios]]: the ratios stay the same when the triangle grows, as long as the angle stays the same.

```interactive
archetype: right-triangle
angle: 30
hypotenuse: 4
drag: size
show-ratios: true
caption: Make the triangle bigger or smaller. The sides change, but the three ratios do not.
```

### `limit-table`

**One-liner:** Tabulates a function's outputs as the input closes in on a value from either side, alongside the function's graph.

**Serves:** approaching a value, one-sided limits, numerical tables.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `function` | `function` | yes | — | — | The function whose outputs are tabulated. |
| `approach` | `number` | yes | — | `[-1000, 1000]` | The value $a$ the input closes in on. |
| `side` | `enum(left, right, both)` | no | `both` | — | Which side the input approaches from. `both` gives one column for each side. |
| `first-gap` | `number` | no | `1` | `[0.000001, 100]` | How far from $a$ the first row's input is. |
| `shrink` | `integer` | no | `10` | `[2, 10]` | Each row's gap is the previous row's gap divided by this. |
| `rows` | `integer` | no | `5` | `[2, 10]` | How many rows each side gets. |
| `decimals` | `integer` | no | `6` | `[1, 12]` | Decimal places for the outputs. |
| `show-graph` | `boolean` | no | `true` | — | Draws the graph with each row's point marked on it. |
| `show-value-at` | `boolean` | no | `true` | — | Shows $f(a)$ under the table, or says it is undefined, so the limit can be compared with the value. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Approaching a value]]: the function is undefined at 1, yet the outputs close in on 2 from both sides.

```interactive
archetype: limit-table
function:
  family: rational
  coefficients: [1, 0, -1]
  denominator: [1, -1]
  label: 'f(x) = \frac{x^2 - 1}{x - 1}'
approach: 1
caption: There is no output at 1 itself, but both columns close in on 2.
```

**Example** — [[Left-hand and right-hand limits]]: the outputs head in opposite directions from the two sides, so there is no single limit.

```interactive
archetype: limit-table
function:
  family: rational
  coefficients: [1]
  denominator: [1, 0]
approach: 0
first-gap: 0.1
rows: 4
show-value-at: true
caption: From the left the outputs grow ever more negative, and from the right ever more positive. The two sides disagree.
```

### `number-line`

**One-liner:** A number line marking points, intervals and distances, with a band you widen or narrow around a centre.

**Serves:** absolute value, intervals and inequalities, closeness and distance.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `range` | `interval` | no | `[-10, 10]` | `[-1000000, 1000000]` | The part of the line shown. |
| `tick` | `number` | no | `1` | `[0.0001, 1000]` | The distance between labelled ticks. |
| `points` | `list of number` | no | `[]` | `[0, 8] items; [-1000000, 1000000]` | Numbers marked and labelled on the line. |
| `intervals` | `list of span` | no | `[]` | `[0, 3] items` | Intervals shaded on the line, with open or filled dots at their ends. |
| `distance` | `pair` | no | `none` | `[-1000000, 1000000]` | Two numbers joined by a bracket labelled with the distance between them, the absolute value of their difference. |
| `centre` | `number` | no | `none` | `[-1000000, 1000000]; needs radius` | The centre of a shaded band. |
| `radius` | `number` | no | `none` | `[0.000001, 1000000]; needs centre` | Shades the numbers whose distance from `centre` is less than this. The learner drags it to widen or narrow the band. |
| `draggable` | `boolean` | no | `true` | — | Whether points, interval ends and the band can be dragged. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Absolute value, intervals, and inequalities]]: one interval written in Wiki notation, and the distance between its ends.

```interactive
archetype: number-line
range: [-5, 5]
intervals:
  - '[-2, 3)'
distance: [-2, 3]
caption: The interval includes -2 but not 3, and its ends are 5 apart.
```

**Example** — [[Closeness and distance]]: every number in the band is less than 0.5 from 2. Narrowing the band is what "closer" means.

```interactive
archetype: number-line
range: [0, 4]
tick: 0.5
centre: 2
radius: 0.5
caption: Every shaded number is less than 0.5 away from 2. Drag the edge to demand closer.
```

**Example** — [[Decimals, ordering, and number lines]]: three decimals that look alike, placed in order.

```interactive
archetype: number-line
range: [0.2, 0.4]
tick: 0.05
points: [0.3, 0.33, 0.303]
draggable: false
caption: 0.3, 0.303 and 0.33 in order, left to right.
```

### `transformation-explorer`

**One-liner:** Sliders that shift, stretch and reflect a base function, leaving its original graph faintly behind for comparison.

**Serves:** translations, reflections, stretches; period, amplitude, phase.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `base` | `function` | yes | — | — | The function before any transformation, $f$. |
| `controls` | `list of enum(horizontal-shift, vertical-shift, horizontal-stretch, vertical-stretch, reflect-in-x-axis, reflect-in-y-axis)` | no | `[horizontal-shift, vertical-shift, horizontal-stretch, vertical-stretch]` | `[1, 6] items` | Which sliders and switches the learner gets. |
| `shift` | `pair` | no | `[0, 0]` | `[-100, 100]` | The starting horizontal shift $h$ and vertical shift $k$. |
| `stretch` | `pair` | no | `[1, 1]` | `[0.1, 10]` | The starting horizontal factor $p$ and vertical factor $q$. The graph drawn is $q \, f\big((x - h)/p\big) + k$. A reflection is a separate switch. |
| `show-base` | `boolean` | no | `true` | — | Leaves the base function's graph faintly behind for comparison. |
| `readout` | `enum(equation, period-and-amplitude, both, none)` | no | `equation` | — | What is written as the sliders move. Period and amplitude are written only for a sine, cosine or tangent base, and nothing is written in their place otherwise. |
| `x-axis` | `enum(numbers, multiples-of-pi)` | no | `numbers` | — | How the x-axis ticks are labelled. |
| `x-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the x-axis shown. |
| `y-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the y-axis shown. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Translations, reflections, and stretches]]: the parabola shifted, with a switch to flip it, while the base stays visible.

```interactive
archetype: transformation-explorer
base:
  family: quadratic
  coefficients: [1, 0, 0]
controls: [horizontal-shift, vertical-shift, vertical-stretch, reflect-in-x-axis]
shift: [2, -1]
caption: A shift of 2 to the right moves the vertex to the right, even though the equation shows x minus 2.
```

**Example** — [[Period, amplitude, phase shifts, and symmetry]]: sine stretched vertically, with period and amplitude read off as the sliders move.

```interactive
archetype: transformation-explorer
base:
  family: sine
  coefficients: [1, 1, 0, 0]
stretch: [1, 2]
readout: both
x-axis: multiples-of-pi
x-range: [-7, 7]
y-range: [-4, 4]
caption: The vertical stretch is the amplitude, and the horizontal stretch scales the period.
```

### `slope-triangle`

**One-liner:** Two points you drag on a grid, joined by a line, with the rise and run between them drawn and their ratio as the slope.

**Serves:** slope of a straight line, rise over run, coordinate differences.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `from` | `point` | yes | — | `[-1000, 1000]` | The first point, $(x_1, y_1)$. |
| `to` | `point` | yes | — | `[-1000, 1000]; differs from from` | The second point, $(x_2, y_2)$. |
| `drag` | `enum(both, from, to, none)` | no | `both` | — | Which points the learner may drag. |
| `snap-to-grid` | `boolean` | no | `true` | — | Whether dragged points settle on whole-number coordinates. |
| `show-differences` | `boolean` | no | `true` | — | Labels the run as $x_2 - x_1$ and the rise as $y_2 - y_1$, with the numbers substituted. |
| `show-slope` | `boolean` | no | `true` | — | Shows the rise over the run and its value, or says the slope is undefined when the run is zero. |
| `extend-line` | `boolean` | no | `true` | — | Extends the line through both points across the grid. |
| `x-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the x-axis shown. |
| `y-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the y-axis shown. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Coordinate differences and rise over run]]: two points, their differences written out, and the slope.

```interactive
archetype: slope-triangle
from: [1, 2]
to: [4, 8]
x-range: [-1, 6]
y-range: [-1, 10]
caption: The run is 4 minus 1 and the rise is 8 minus 2, so the slope is 6 over 3, which is 2.
```

**Example** — [[Slope of a straight line]]: a line falling to the right has a negative slope, and a line rising to the right a positive one.

```interactive
archetype: slope-triangle
from: [-2, 3]
to: [4, 0]
caption: The line falls to the right, so its slope, minus a half, is negative. Drag a point to make it rise.
```

### `piecewise-explorer`

**One-liner:** Draws a function defined in pieces, marking holes and jumps, and compares each side's limit with the value at a point.

**Serves:** piecewise functions, holes and jumps, continuity.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `pieces` | `list of piece` | yes | — | `[1, 4] items` | The pieces, each a function on a span. |
| `values` | `list of point` | no | `[]` | `[0, 4] items; [-1000, 1000]` | Single points where the function's value is set apart from any piece, drawn filled, such as a value placed above a hole. |
| `probe` | `number` | no | `none` | `[-1000, 1000]` | An input, draggable by the learner, at which the left-hand limit, the right-hand limit and the value are compared. |
| `show-readout` | `boolean` | no | `true` | — | Writes the three numbers at the probe and whether they agree. |
| `x-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the x-axis shown. |
| `y-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the y-axis shown. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Piecewise functions, holes, and jumps]]: a jump at 1, with the filled dot showing which piece owns the join.

```interactive
archetype: piecewise-explorer
pieces:
  - function:
      family: linear
      coefficients: [1, 0]
    on: '(-inf, 1)'
  - function:
      family: linear
      coefficients: [0, 3]
    on: '[1, inf)'
probe: 1
x-range: [-3, 4]
y-range: [-3, 5]
caption: From the left the graph heads for 1, from the right it sits at 3. That is a jump.
```

**Example** — [[Comparing the limit with the function value]]: both sides agree on a limit of 2, but the value placed at the hole is 4.

```interactive
archetype: piecewise-explorer
pieces:
  - function:
      family: linear
      coefficients: [1, 1]
    on: '(-inf, 1)'
  - function:
      family: linear
      coefficients: [1, 1]
    on: '(1, inf)'
values:
  - [1, 4]
probe: 1
x-range: [-2, 4]
y-range: [-1, 5]
caption: The limit at 1 is 2, but the value there is 4. They disagree, so the function is not continuous at 1.
```

### `expression-stepper`

**One-liner:** Steps through an algebraic working one line at a time, each line giving the reason it follows from the line before.

**Serves:** factorisation, simplification, index laws, algebraic fractions.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `steps` | `list of step` | yes | — | `[2, 12] items` | The working, first line first. |
| `connective` | `enum(equals, implies, none)` | no | `equals` | — | What is written between lines. Use `equals` when each line is the same expression rewritten, and `implies` when each line is an equation that follows from the one before. |
| `reveal` | `enum(one-at-a-time, all-at-once)` | no | `one-at-a-time` | — | Whether the learner steps through the lines or sees them all at once. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Common factors, quadratics, and difference of squares]]: a quadratic factorised by splitting the middle term.

```interactive
archetype: expression-stepper
steps:
  - latex: 'x^2 - 5x + 6'
  - latex: 'x^2 - 2x - 3x + 6'
    because: Split -5x into two terms whose numbers multiply to 6 and add to -5.
  - latex: 'x(x - 2) - 3(x - 2)'
    because: Take a common factor out of each pair.
  - latex: '(x - 2)(x - 3)'
    because: Take out the common bracket.
caption: Each line is the same expression, written differently.
```

**Example** — [[Index laws and fractional powers]]: a fractional power taken as a root first, then a power.

```interactive
archetype: expression-stepper
steps:
  - latex: '8^{\frac{2}{3}}'
  - latex: '\left(8^{\frac{1}{3}}\right)^2'
    because: A power of a power multiplies the indices, so this is the same number.
  - latex: '2^2'
    because: The cube root of 8 is 2.
  - latex: '4'
caption: Taking the root first keeps the numbers small.
```

### `ratio-scaler`

**One-liner:** Two linked quantities scaled together by one slider, so their ratio stays fixed while both amounts change.

**Serves:** ratios, proportion, units, average speed.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `first` | `quantity` | yes | — | — | The first quantity at scale 1. |
| `second` | `quantity` | yes | — | — | The second quantity at scale 1. |
| `scale` | `number` | no | `1` | `[0, 1000]; within scale-range` | The starting multiplier, applied to both quantities at once. At 0 both amounts are 0, where a double number line starts. |
| `scale-range` | `interval` | no | `[0, 10]` | `[0, 1000]` | The values the slider moves the multiplier through. |
| `view` | `enum(double-number-line, bars, table)` | no | `double-number-line` | — | How the two quantities are shown side by side. |
| `show-unit-rate` | `boolean` | no | `true` | — | Shows how much of the second quantity goes with one of the first, such as km per hour. |
| `decimals` | `integer` | no | `2` | `[0, 6]` | Decimal places for amounts and the unit rate. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Ratios, proportion, units, and average speed]]: 150 km in 2 hours, scaled to any other time at the same average speed.

```interactive
archetype: ratio-scaler
first:
  label: time
  value: 2
  unit: h
second:
  label: distance
  value: 150
  unit: km
scale-range: [0, 3]
caption: Every pair on the line is the same journey's pace, 75 km for each hour.
```

### `grid-plotter`

**One-liner:** A coordinate grid where you plot points from a table or read their coordinates off, each point labelled as you place it.

**Serves:** coordinates, tables and plotting.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `task` | `enum(explore, plot-from-table, read-coordinates)` | no | `explore` | — | In `explore` the learner places points freely, starting from any given points. In `plot-from-table` the points are given as a table and placed one by one. In `read-coordinates` they are drawn, and each point's coordinates are shown only once the learner names them. |
| `points` | `list of point` | no | `[]` | `[0, 12] items; [-1000, 1000]` | The given points. |
| `join` | `boolean` | no | `false` | — | Joins the points in order of their x-coordinates once all are placed. |
| `show-table` | `boolean` | no | `true` | — | Shows the points as an x and y table beside the grid. |
| `snap-to-grid` | `boolean` | no | `true` | — | Whether placed points settle on the tick marks. |
| `tick` | `number` | no | `1` | `[0.01, 100]` | The distance between grid lines on both axes. |
| `x-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the x-axis shown. |
| `y-range` | `interval` | no | `[-10, 10]` | `[-1000, 1000]` | The part of the y-axis shown. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Coordinates, tables, and plotting]]: a table of values for $y = 2x + 1$, plotted point by point, then joined.

```interactive
archetype: grid-plotter
task: plot-from-table
points:
  - [-2, -3]
  - [-1, -1]
  - [0, 1]
  - [1, 3]
  - [2, 5]
join: true
x-range: [-4, 4]
y-range: [-5, 7]
caption: Each row of the table is one point. Joined in order, they make a straight line.
```

### `squeeze-visual`

**One-liner:** Shows why sin h / h tends to 1 and (cos h - 1) / h tends to 0, trapping each quotient between bounds as h shrinks.

**Serves:** the limits of sin h / h and (cos h - 1) / h as h approaches zero.

| Parameter | Type | Required | Default | Range | Meaning |
|---|---|---|---|---|---|
| `limit` | `enum(sin-h-over-h, cos-h-minus-1-over-h)` | yes | — | — | Which of the two limits is shown. |
| `h` | `number` | no | `0.5` | `[-1.5, 1.5]; excluding 0` | The starting angle in radians. The slider moves it towards zero from either side, never reaching it. |
| `show-geometry` | `boolean` | no | `true` | — | Draws the unit-circle picture the bounds are read from, with its lengths and areas labelled. |
| `show-bounds` | `boolean` | no | `true` | — | Writes the lower bound, the quotient and the upper bound, with their current values. |
| `show-graph` | `boolean` | no | `true` | — | Graphs the quotient and both bounds near zero, with an open dot at zero itself. |
| `decimals` | `integer` | no | `6` | `[1, 12]` | Decimal places for the values. |
| `caption` | `text` | no | `none` | — | One line saying what to notice. |

**Example** — [[Limit of sin h over h as h approaches zero]]: the quotient is trapped between $\cos h$ and $1$, and both close in on 1.

```interactive
archetype: squeeze-visual
limit: sin-h-over-h
h: 0.8
caption: The quotient is caught between cos h and 1. As h shrinks, both close in on 1, and so must it.
```

**Example** — [[Limit of (cos h - 1) over h as h approaches zero]]: the quotient lies between minus and plus half of h, so it is squeezed to 0.

```interactive
archetype: squeeze-visual
limit: cos-h-minus-1-over-h
h: 1
show-geometry: false
caption: The quotient never strays further from 0 than half of h does, so as h shrinks it goes to 0.
```
