---
kind: source
domain: sources
requires: []
status: drafted
reviewed_by: none
created: 2026-10-03
updated: 2026-10-03
source_file: raw/openstax-prealgebra-2e/10-4-divide-monomials.html
source_type: textbook
date_ingested: 2026-10-03
aliases:
  - Divide Monomials (OpenStax)
tags:
  - algebra
---

## In one sentence

Section 10.4 of OpenStax *Prealgebra 2e*, "Divide Monomials": the quotient rule for
whole-number indices, $\frac{a^m}{a^n} = a^{m-n}$ when $m > n$ and $\frac{1}{a^{n-m}}$ when
$n > m$, found by cancelling common factors; the zero index, $a^0 = 1$ for non-zero $a$,
found from $\frac{a^m}{a^m} = 1$; the power of a quotient,
$\left(\frac{a}{b}\right)^m = \frac{a^m}{b^m}$; and all six index laws combined to simplify
expressions and divide monomials such as $\frac{42x^2y^3}{-7xy^5} = -\frac{6x}{y^2}$.

## Citation

Lynn Marecek, MaryAnne Anthony-Smith and Andrea Honeycutt Mathis, *Prealgebra 2e*, OpenStax,
Rice University, published 11 March 2020 (web version revised 29 June 2026). Section 10.4,
"Divide Monomials":
<https://openstax.org/books/prealgebra-2e/pages/10-4-divide-monomials>.
Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The
page's attribution notice asks that a noncommercial digital redistribution include on every
digital page view this attribution:
Access for free at <https://openstax.org/books/prealgebra-2e/pages/1-introduction>.

## What it covers

Cite it for these claims, and for no others:

- The three multiplication laws restated as a summary, for real $a$, $b$ and whole numbers
  $m$, $n$: $a^m \cdot a^n = a^{m+n}$, $(a^m)^n = a^{m \cdot n}$ and $(ab)^m = a^m b^m$. Serves
  [[Index laws and fractional powers]], as the ground this section builds on.
- Equivalent fractions as the tool for division: for whole numbers $a$, $b$, $c$ with
  $b \ne 0$, $c \ne 0$, $\frac{a}{b} = \frac{a \cdot c}{b \cdot c}$ and
  $\frac{a \cdot c}{b \cdot c} = \frac{a}{b}$, so a fraction is simplified "by dividing out
  common factors from the numerator and denominator"; the same tool works for "algebraic
  fractions, which are also quotients". Serves [[Equivalent fractions and cancellation]] and
  [[Algebraic fractions and rationalisation]].
- The quotient rule found by writing out the factors: $\frac{x^5}{x^2}
  = \frac{x \cdot x \cdot x \cdot x \cdot x}{x \cdot x \cdot 1} = x^3$ and
  $\frac{x^2}{x^3} = \frac{x \cdot x \cdot 1}{x \cdot x \cdot x} = \frac{1}{x}$: "in each case
  the bases were the same and we subtracted the exponents", leaving factors in the numerator
  when the larger index is there and in the denominator, with $1$ on top, when it is there.
  Serves [[Index laws and fractional powers]].
- The quotient rule stated for a real number $a \ne 0$ and whole numbers $m$, $n$:
  $\frac{a^m}{a^n} = a^{m-n}$ for $m > n$, and $\frac{a^m}{a^n} = \frac{1}{a^{n-m}}$ for
  $n > m$. The first step of every example is to "compare the exponents in the numerator and
  denominator". Examples $\frac{x^{10}}{x^8} = x^2$, $\frac{2^9}{2^2} = 2^7$ left as a power,
  $\frac{b^{10}}{b^{15}} = \frac{1}{b^5}$, $\frac{3^3}{3^5} = \frac{1}{3^2} = \frac{1}{9}$,
  $\frac{a^5}{a^9} = \frac{1}{a^4}$ and $\frac{x^{11}}{x^7} = x^4$. Serves
  [[Index laws and fractional powers]] and, for the condition $a \ne 0$,
  [[Division restrictions]].
- Each law checked with numbers before use: $\frac{3^4}{3^2} \overset{?}{=} 3^{4-2}$,
  $\frac{81}{9} \overset{?}{=} 3^2$, $9 = 9$; $\frac{5^2}{5^3} \overset{?}{=} \frac{1}{5^{3-2}}$,
  $\frac{25}{125} = \frac{1}{5}$; and $\left(\frac{2}{3}\right)^3 = \frac{8}{27}
  = \frac{2^3}{3^3}$. Serves [[Index laws and fractional powers]].
- The zero index, found two ways from a number divided by itself: $\frac{2}{2} = 1$,
  $\frac{17}{17} = 1$, $\frac{-43}{-43} = 1$ and $\frac{x}{x} = 1$ for $x \ne 0$; then
  $\frac{8}{8} = 1$ written as $\frac{2^3}{2^3} = 2^{3-3} = 2^0$, so $2^0 = 1$, and in general
  $\frac{a^m}{a^m}$ is both $a^0$ and $1$. Stated as "If $a$ is a non-zero number, then
  $a^0 = 1$", with "In this text, we assume any variable that we raise to the zero power is
  not zero"; $12^0 = 1$ and $y^0 = 1$. Serves [[Index laws and fractional powers]] and
  [[Division restrictions]].
- Zero index of an expression and what the index applies to: $(2x)^0 = 2^0 x^0 = 1 \cdot 1
  = 1$, so "any non-zero expression raised to the zero power is one", $(7z)^0 = 1$ and
  $(-3x^2y)^0 = 1$; but in $-3x^2y^0$ "only the variable $y$ is being raised to the zero
  power", so $-3x^2y^0 = -3x^2 \cdot 1 = -3x^2$. Serves [[Index laws and fractional powers]]
  and [[Powers and radicals]].
- Power of a quotient found by multiplying fractions: $\left(\frac{x}{y}\right)^3
  = \frac{x}{y} \cdot \frac{x}{y} \cdot \frac{x}{y} = \frac{x \cdot x \cdot x}{y \cdot y \cdot y}
  = \frac{x^3}{y^3}$, "the exponent applies to both the numerator and the denominator"; stated
  for real $a$, $b$ with $b \ne 0$ and a counting number $m$ as
  $\left(\frac{a}{b}\right)^m = \frac{a^m}{b^m}$, "To raise a fraction to a power, raise the
  numerator and denominator to that power." Examples $\left(\frac{5}{8}\right)^2 = \frac{25}{64}$,
  $\left(\frac{x}{3}\right)^4 = \frac{x^4}{81}$ and $\left(\frac{y}{m}\right)^3 = \frac{y^3}{m^3}$.
  Serves [[Index laws and fractional powers]] and, for $b \ne 0$, [[Division restrictions]].
- The summary of all six laws for real $a$, $b$ and whole numbers $m$, $n$: the three
  multiplication laws, the quotient rule in both forms with $a \ne 0$, the zero index
  $a^0 = 1$ with $a \ne 0$, and the power of a quotient with $b \ne 0$; "Notice that they are
  now defined for whole number exponents." Serves [[Index laws and fractional powers]].
- Applying several laws in one simplification: $\frac{(x^2)^3}{x^5} = \frac{x^6}{x^5} = x$;
  $\frac{m^8}{(m^2)^4} = \frac{m^8}{m^8} = m^0 = 1$; $\left(\frac{x^7}{x^3}\right)^2
  = (x^{7-3})^2 = (x^4)^2 = x^8$, because "parentheses come before exponents, and the bases
  are the same so we can simplify inside the parentheses"; $\left(\frac{p^2}{q^5}\right)^3
  = \frac{p^6}{q^{15}}$, where "we cannot simplify inside the parentheses first, since the
  bases are not the same"; $\left(\frac{2x^3}{3y}\right)^4 = \frac{2^4 (x^3)^4}{3^4 y^4}
  = \frac{16x^{12}}{81y^4}$; and $\frac{(y^2)^3 (y^2)^4}{(y^5)^4} = \frac{y^{14}}{y^{20}}
  = \frac{1}{y^6}$. Serves [[Index laws and fractional powers]] and, for brackets before
  indices, [[Signed arithmetic and order of operations]].
- Dividing monomials by separating "the number part from the variable part" into one
  fraction each: $56x^5 \div 7x^2$ rewritten as $\frac{56x^5}{7x^2} = \frac{56}{7} \cdot
  \frac{x^5}{x^2} = 8x^3$; one fraction for each variable, $\frac{42x^2y^3}{-7xy^5}
  = \frac{42}{-7} \cdot \frac{x^2}{x} \cdot \frac{y^3}{y^5} = -6 \cdot x \cdot \frac{1}{y^2}
  = -\frac{6x}{y^2}$ and $\frac{24a^5b^3}{48ab^4} = \frac{1}{2} \cdot a^4 \cdot \frac{1}{b}
  = \frac{a^4}{2b}$; in one step, $\frac{14x^7y^{12}}{21x^{11}y^6} = \frac{2y^6}{3x^4}$, with
  the warning to simplify $\frac{14}{21}$ "by dividing out a common factor" and the variables
  "by subtracting their exponents"; and, because "the fraction bar is a grouping symbol", the
  numerator first, $\frac{(3x^3y^2)(10x^2y^3)}{6x^4y^5} = \frac{30x^5y^5}{6x^4y^5} = 5x$.
  Serves [[Index laws and fractional powers]], [[Equivalent fractions and cancellation]] and
  [[Algebraic fractions and rationalisation]].

The section has **no negative index**: a quotient with the larger index below is always left
as $\frac{1}{a^{n-m}}$, never written $a^{-k}$, and the zero index is a *definition* rather
than a case of a law for all integers. It has **no fractional powers**. A Note must not cite
it for either. It also holds a readiness quiz ("Be Prepared"), the text's own house rule that
a numerical power is worked out when the index is at most $3$ and otherwise "left in
exponential form", a forward reference to dividing polynomials, five "Media" links to videos,
the numbered exercise set, "Everyday Math" exercises on memory sizes as $10^6$, $10^9$ and
$10^{12}$ bytes, writing exercises (including $-3^0$ against $(-3)^0$ and a claim that $n^0$
is $0$) and a self-check. No Node needs them, so no Note should cite the section for them.

## Notation it uses

Each entry below records how this source writes the convention, attributed to it:

- [[Conventions#Index and power]]: *exponent* for the index and *base* for what is raised,
  "raised to the zero power" and "the zero exponent"; *exponential form* for a power left
  unevaluated, $2^7$, against "apply the exponent" for working one out, $3^2 = 9$; and *the
  properties of exponents* for what this Wiki calls the index laws. The indices are *whole
  numbers* in the quotient rule and a *counting number* in the power of a quotient.
- [[Conventions#Index laws by name]]: *Quotient Property of Exponents*, in two forms by which
  index is larger; *Zero Exponent*, called a *definition* ("Zero Exponent Definition", "the
  definition of the zero exponent") and also "the Zero Exponent Property" and "Zero power
  property"; *Quotient to a Power Property of Exponents*; *the Quotient Rule* and *the Product
  to a Power Rule* once each for the same laws; collectively *the Properties of Exponents*.
  The multiplication laws are written with a centred dot, as in section 10.2.
- [[Conventions#Multiplication sign]]: a centred dot between repeated letters,
  $x \cdot x \cdot x$, between fractions, $\frac{x}{y} \cdot \frac{x}{y} \cdot \frac{x}{y}$ and
  $\frac{56}{7} \cdot \frac{x^5}{x^2}$, and between a number, a letter and a fraction,
  $-6 \cdot x \cdot \frac{1}{y^2}$ and $\frac{1}{2} \cdot a^4 \cdot \frac{1}{b}$; brackets as
  the multiplication sign, $(3x^3y^2)(10x^2y^3)$; no sign between a number and a letter or
  between letters, $8x^3$, $16x^{12}$ and $42x^2y^3$, with the number written first.
- [[Conventions#Implied multiplication after division]]: it writes $\div$ before a product
  with no sign, $56x^5 \div 7x^2$ and $36x^3 \div (-2x^9)$, meaning $\frac{56x^5}{7x^2}$,
  which this Wiki never does.
- [[Conventions#Division sign and quotient]]: "Find the quotient" as the instruction, the
  quotient written with $\div$ and the first step "Rewrite as a fraction".
- [[Conventions#Brackets]]: it writes *parentheses* for $(\,)$.
- [[Conventions#Order of operations]]: "Remember parentheses come before exponents" and "the
  fraction bar is a grouping symbol", naming no mnemonic; a writing exercise asks the reader
  to use "the Order of Operations" to tell $-3^0$ from $(-3)^0$.
- [[Conventions#Decimal point and digit groups]]: a decimal point, $0.3$ in the one exercise
  that has a decimal; no number long enough to group.
- [[Conventions#Division restriction]]: the excluded value written after a comma in the
  boxed statement, $a \ne 0$, and "a non-zero number", "nonzero" and "not zero" in prose.
- [[Conventions#Cancelling common factors]]: *dividing out common factors* "using the
  Equivalent Fractions Property", $\frac{a}{b} = \frac{a \cdot c}{b \cdot c}$, written with a
  $1$ left in place of the factors removed, $\frac{x \cdot x \cdot x \cdot x \cdot x}{x \cdot x \cdot 1}$;
  the word *cancel* does not appear in its text.
- [[Conventions#Term, coefficient and constant]]: *monomial* for a one-term expression such as
  $56x^5$, a word this Wiki has not adopted, and *the number part* and *the variable part* of
  a monomial where this Wiki would say coefficient and letters.
- [[Conventions#Equation, solution and solve]]: a numerical check of a law, not of a solution,
  written with a question mark over the equals sign and a tick after the last line,
  $\frac{3^4}{3^2} \overset{?}{=} 3^{4-2}$, $9 = 9$.

*Simplify* is its instruction for applying the laws and *Find the quotient* for dividing
monomials. Fractions are stacked, $\frac{x^5}{x^2}$, and a fraction raised to a power is
bracketed, $\left(\frac{a}{b}\right)^m$. A negative quotient carries its sign in front of the
fraction, $-\frac{6x}{y^2}$. Variables are single italic letters, and the bases in the laws
are $a$, $b$ with indices $m$, $n$. Its worked solutions put each intermediate step with the
index highlighted into an image, with the expression repeated in the image's `alt` text. It
spells in American English (*summarize*), which is spelling, not notation: a Note citing it
still writes British English.

## The extract

`source_file` is the section's content element, the `<div data-type="page">` of the page
above, cut out exactly as the page served it on 2026-10-03. Nothing in it was edited,
reformatted or converted. Its mathematics is MathML, as published, and its worked-solution
steps and figures are links to OpenStax's servers rather than copies. The file's SHA-256 is
in `raw/checksums.sha256`, and `check` fails if a byte of it changes.
