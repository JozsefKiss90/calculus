# Floor Plausibility

A Floor Note is a concept Note with `requires: []`: the Module assumes the learner arrives
knowing it, at 8th-grade mathematics. One whose content is clearly above 8th grade is an
unfinished expansion pretending to be a Floor Node, and no script can see that. So a human
judges each one here, and `check` grades the judgements: 0 flagged is green, 1 is yellow,
2 or more is red and fails the build.

`npm run check` lists every Floor Note that has no judgement yet. Add one row per Floor Note
to the table below. The **Note** is a wikilink to it. The **Verdict** is `plausible` or
`flagged`. A flagged Note must give a **Reason**, which can be left empty for a plausible one.
Write a `|` inside a Reason as `\|`.

An unjudged Floor Note never counts as plausible. A row whose Note has since gained a
prerequisite is reported as stale and counts for nothing. Delete it, or judge again if the
Note is ever a Floor Note again. Only a human writes this file. No agent records a verdict.

| Note | Verdict | Reason |
|---|---|---|
| [[Division restrictions]] | plausible | |
| [[Equivalent fractions and cancellation]] | plausible | |
| [[Factors and multiples]] | plausible | |
| [[Inverse operations]] | plausible | |
| [[Multiplication, division, squares, and roots]] | plausible | |
| [[Signed arithmetic and order of operations]] | plausible | |
| [[Coordinates, tables, and plotting]] | plausible | |
| [[Inputs, outputs, and composition]] | plausible | |
| [[Decimals, ordering, and number lines]] | plausible | |