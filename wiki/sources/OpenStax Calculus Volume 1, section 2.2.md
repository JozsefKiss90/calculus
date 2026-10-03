---
kind: source
domain: sources
requires: []
status: drafted
reviewed_by: none
created: 2026-10-03
updated: 2026-10-03
source_file: raw/openstax-calculus-volume-1/2-2-the-limit-of-a-function.html
source_type: textbook
date_ingested: 2026-10-03
aliases:
  - The Limit of a Function (OpenStax)
tags:
  - limits
---

## In one sentence

Section 2.2 of OpenStax *Calculus Volume 1*, "The Limit of a Function": the limit introduced
informally, estimated from tables of values and from graphs, with one-sided limits, infinite
limits and vertical asymptotes.

## Citation

Gilbert Strang, Edwin "Jed" Herman and others, *Calculus Volume 1*, OpenStax, Rice
University, published 30 March 2016. Section 2.2, "The Limit of a Function":
<https://openstax.org/books/calculus-volume-1/pages/2-2-the-limit-of-a-function>.
Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
Access for free at <https://openstax.org/books/calculus-volume-1/pages/1-introduction>.

## What it covers

Cite it for these claims, and for no others:

- The informal definition of $\lim_{x \to a} f(x) = L$: the values $f(x)$ approach $L$ as $x$
  approaches $a$ from either side, with $x \neq a$. Serves [[Approaching a value]].
- Estimating a limit from a table of values on both sides of $a$, and from a graph, including
  where the estimate misleads, as with $\sin(1/x)$ near $0$. Serves
  [[Numerical tables and graph behaviour]].
- A limit that differs from the function's value, or exists where the function is undefined.
  Serves [[Comparing the limit with the function value]].
- Limits from the left and from the right, and the theorem that the two-sided limit exists
  exactly when both exist and agree. Serves [[Left-hand and right-hand limits]].
- One-sided limits of a piecewise function at its break. Serves
  [[Piecewise functions, holes, and jumps]].

Infinite limits and vertical asymptotes are in the section too. No Node of Module 1 teaches
them, so no Note should need them.

## Notation it uses

Each entry below records how this source writes the convention, attributed to it:

- [[Conventions#Limit]]
- [[Conventions#One-sided limits]]
- [[Conventions#A limit that does not exist]]: it writes DNE, and $+\infty$ with its sign.
- [[Conventions#Function notation]]
- [[Conventions#Piecewise definitions]]
- [[Conventions#Intervals]]
- [[Conventions#Decimal point and digit groups]]: it groups digits with commas, $10{,}000$.
- [[Conventions#Multiplication sign]]
- [[Conventions#Slope]]

It spells in American English (*behavior*), which is spelling, not notation: a Note citing it
still writes British English.

## The extract

`source_file` is the section's content element, the `<div data-type="page">` of the page
above, cut out exactly as the page served it on 2026-10-03. Nothing in it was edited,
reformatted or converted. Its mathematics is MathML, as published, and its figures are links
to OpenStax's servers rather than copies. The file's SHA-256 is in `raw/checksums.sha256`,
and `check` fails if a byte of it changes.
