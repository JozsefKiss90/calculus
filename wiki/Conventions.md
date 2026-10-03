---
kind: reference
domain: wiki
requires: []
status: drafted
reviewed_by: none
created: 2026-10-02
updated: 2026-10-03
aliases:
  - Notation
tags:
  - conventions
---

## In one sentence

Which symbol and which word this Wiki uses for each idea, and how other sources write it
when they disagree.

## How to use this

Look up the symbol or term you are about to write. **This Wiki** is what you write. Each
**Elsewhere** line is a convention a learner will meet in another source, then who uses it.
Where it would trip a learner up, say so once, in the Note that introduces the idea. Never
resolve a disagreement silently by writing the other form. Spelling is British English
throughout: *factorise*, *centre*, *recognise*.

Every entry has the same shape: the symbol or term as its heading, one **This Wiki** line,
and an **Elsewhere** line for each conflicting convention, attributed after a dash — or a
single "**Elsewhere:** none known". A **Same** line names a source that writes it this Wiki's
way. Each line attributes one source, so two sources that disagree are two lines, never one.
Mathematics is KaTeX: `check` rejects anything else.

## Entries

### Order of operations

- **This Wiki:** brackets, then indices, then multiplication and division, then addition and subtraction — called **BIDMAS**, as UK schools teach it. Multiplication and division share one rank and are worked left to right; so are addition and subtraction: $8 - 3 + 2 = 7$, not $3$.
- **Same:** "the order of operations says to work in the parentheses first", naming no mnemonic — [[OpenStax Prealgebra 2e, section 7.3]].
- **Same:** "following the order of operations", and "Add and subtract left to right", naming no mnemonic — [[OpenStax Prealgebra 2e, section 2.2]].
- **Same:** "the parentheses tell us to raise the $(-3)$ to the 4th power" against "we raise only the $3$ to the 4th power and then find the opposite", so $(-3)^4 = 81$ and $-3^4 = -81$, naming no mnemonic — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** BODMAS (*Orders* or *Of* for indices) — UK and Commonwealth schools, older texts.
- **Elsewhere:** PEMDAS (*Parentheses, Exponents*) — US schools. BEDMAS — Canadian schools. Same rule. Every mnemonic's letter order wrongly suggests a ranking within each pair: division before multiplication in BIDMAS, BODMAS and BEDMAS, the reverse in PEMDAS, and addition before subtraction in all four.
- **Same:** "Remember parentheses come before exponents" and "the fraction bar is a grouping symbol", naming no mnemonic; a writing exercise asks for "the Order of Operations" to tell $-3^0$ from $(-3)^0$ — [[OpenStax Prealgebra 2e, section 10.4]].
- **Same:** "Remember to always follow the order of operations", "Do exponents before multiplication" and "Simplify inside the parentheses first", so $4 \cdot 2^{-1} = 2$ but $(4 \cdot 2)^{-1} = \frac{1}{8}$, naming no mnemonic — [[OpenStax Prealgebra 2e, section 10.5]].

### Implied multiplication after division

- **This Wiki:** never write $\div$ or $/$ before a product written without a sign. Write $\frac{1}{2a}$ or $\frac{1}{2}a$, whichever is meant.
- **Same:** the product before the sign, never after it: $10x \div 3$, $10x/3$ and $\frac{10x}{3}$ for the quotient of $10x$ and $3$; $a \div b$, $a/b$ and $\frac{a}{b}$ offered as the same quotient — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** $1/2a$ read as $\frac{1}{2a}$, binding $2a$ first — many physics and engineering texts, and some calculators. A strict left-to-right reading of BIDMAS gives $\frac{1}{2}a$, so $6 \div 2(1 + 2)$ has no agreed value.
- **Elsewhere:** $\div$ before a product written without a sign, $56x^5 \div 7x^2$ and $36x^3 \div (-2x^9)$, meaning $\frac{56x^5}{7x^2}$: its first step is "Rewrite as a fraction" — [[OpenStax Prealgebra 2e, section 10.4]].

### Brackets

- **This Wiki:** *brackets* are $( \, )$, *square brackets* $[ \, ]$, *braces* $\{ \, \}$.
- **Elsewhere:** *parentheses* for $( \, )$ and *brackets* for $[ \, ]$ — US texts.
- **Elsewhere:** *parentheses* for $( \, )$ — [[OpenStax Prealgebra 2e, section 7.3]].
- **Elsewhere:** *parentheses* for $( \, )$ — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** *parentheses* for $( \, )$, "remove any parentheses" — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** *parentheses* for $( \, )$, "the parentheses tell us to raise the $(-3)$ to the 4th power" — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** *parentheses* for $( \, )$, "parentheses come before exponents" — [[OpenStax Prealgebra 2e, section 10.4]].
- **Elsewhere:** *parentheses* for $( \, )$, "Here the parentheses make the exponent apply to the base $5y$" — [[OpenStax Prealgebra 2e, section 10.5]].
- **Elsewhere:** *parentheses* for $( \, )$, once, in a figure's `alt` text, "2x times parentheses x plus 3"; the word does not appear in its prose — [[OpenStax Prealgebra 2e, section 10.6]].

### Index and power

- **This Wiki:** in $2^3$ the $3$ is the *index* (plural *indices*), and $2^3$ is a *power* of $2$: "two to the power three". The laws are the *index laws*.
- **Elsewhere:** *exponent* for the index — US texts, and most university texts everywhere.
- **Elsewhere:** *exponent* for the index, "the variable is an exponent" in $2^x$, and "raised to the power of $1$" — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** *exponent* for the index and *base* for what is raised, "the exponent tells us how many times we use the base $a$ as a factor"; *exponential notation* for $a^m$, read "$a$ to the $m$th power"; *exponential expression*; and *the properties of exponents* for the index laws — [[OpenStax Prealgebra 2e, section 10.2]].

- **Same:** no sign between a number and a letter or between letters, $8x^3$, $16x^{12}$ and $42x^2y^3$, the number written first — [[OpenStax Prealgebra 2e, section 10.4]].
- **Elsewhere:** *exponent* for the index and *base* for what is raised, "raised to the zero power" and "the zero exponent"; *exponential form* for a power left unevaluated, $2^7$, against "apply the exponent" for working one out, $3^2 = 9$; and *the properties of exponents* for the index laws — [[OpenStax Prealgebra 2e, section 10.4]].
- **Elsewhere:** *exponent* for the index and *base* for what is raised, "the base that is raised to each exponent"; *negative exponent*, *integer exponents* and *positive exponents* for the kinds of index, and "the exponent, $n$, on the factor $10$"; *exponential form* for a power of ten left as $10^3$; and *the properties of exponents* or *the exponent properties* for the index laws — [[OpenStax Prealgebra 2e, section 10.5]].
- **Elsewhere:** *exponent* for the index, "Write all variables with exponents in expanded form", so $x^3$ is written $x \cdot x \cdot x$ before common factors are matched; and "variables raised to powers along with coefficients" — [[OpenStax Prealgebra 2e, section 10.6]].
### Multiplication sign

- **This Wiki:** $\times$ between numbers, $3 \times 4$; no sign between letters or a number and a letter, $3ab$. Never $*$, and never $\cdot$ between numbers.
- **Same:** no sign between a number and a letter, $\sin 2x$ — [[OpenStax Calculus Volume 1, section 2.2]].
- **Same:** no sign between a number and a letter, $3x$, and the number written first: $m \cdot 4$ is written $4m$ — [[OpenStax Prealgebra 2e, section 7.3]].
- **Same:** no sign between a number and a letter, $9x$ for $9$ times $x$, and the number written first — [[OpenStax Prealgebra 2e, section 2.2]].
- **Same:** no sign between a number and a letter, $4x$ and $3.4x$, the number written first, and a fractional coefficient stacked before the letter, $\frac{3}{2}x$; no centred dot appears in its text — [[OpenStax Prealgebra 2e, section 8.3]].
- **Same:** no sign between letters, $rt$, $bh$ and $Prt$, nor between a number and a letter, $65t$ and $2A$, with a fractional coefficient stacked before the letters, $\frac{1}{2}bh$ — [[OpenStax Prealgebra 2e, section 9.7]].
- **Same:** no sign between a number and a letter or between letters, $2x$, $121x^2$ and $27x^3y^3$, the number written first, and a fractional coefficient stacked before the letters, $\frac{3}{4}c^3d$ — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** a centred dot between numbers, $3 \cdot 4$ — US texts and much of continental Europe. Older British printing raises the decimal point to the centre, $2{\cdot}5$, so there the centred dot is not multiplication.
- **Elsewhere:** a centred dot between numbers, $3 \cdot x + 3 \cdot 4$ and $6 \cdot 5y$, and a negative factor in brackets, $(-2) \cdot 1$ and $(-10)(0.9)$ — [[OpenStax Prealgebra 2e, section 7.3]].
- **Elsewhere:** a centred dot between numbers, $9 \cdot 5$ and $2 \cdot x \cdot x$, and brackets as a multiplication sign, $9(1)$, $a(b)$ and $(a)(b)$: "Both the dot and the parentheses tell us to multiply" — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** brackets as the multiplication sign when a number is substituted, $4(-5) + 6$ and $5(7)$, in its worked-solution images; and a number against a bracket with no sign, $3(x + 2)$ — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** a centred dot between numbers, $12 \cdot 3\frac{1}{2}$ and $65 \cdot 8$, and between letters when naming a step, "Multiply $r \cdot t$"; brackets as the multiplication sign when a number is substituted, $3(4) + 2y$ and $P(0.28)$, and around a product treated as one factor, $I = P(rt)$, in its worked-solution images — [[OpenStax Prealgebra 2e, section 9.7]].
- **Elsewhere:** a centred dot between numbers, $5 \cdot 5 \cdot 5$ and $4 \cdot 8$, and between powers and letters, $x^2 \cdot x^3$ and $c^3 \cdot c \cdot d \cdot d^2$, including in the laws, $a^m \cdot a^n = a^{m+n}$; brackets as the multiplication sign, $(-3)(-3)(-3)(-3)$, $(0.74)(0.74)$, $(4x^2)(-5x^3)$ and $40{,}000(1.05)$; and an asterisk, "x*x", in the `alt` text of two figures — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** a centred dot between repeated letters, $x \cdot x \cdot x$, between fractions, $\frac{x}{y} \cdot \frac{x}{y} \cdot \frac{x}{y}$ and $\frac{56}{7} \cdot \frac{x^5}{x^2}$, and between a number, a letter and a fraction, $-6 \cdot x \cdot \frac{1}{y^2}$, including in the laws, $a^m \cdot a^n = a^{m+n}$; brackets as the multiplication sign, $(3x^3y^2)(10x^2y^3)$ — [[OpenStax Prealgebra 2e, section 10.4]].
- **Same:** $\times$ between two numbers in scientific notation, $3.7 \times 10^4$ and $4 \times 10^{-3}$, with the remark "It is customary in scientific notation to use $\times$ as the multiplication sign, even though we avoid using this sign elsewhere in algebra"; no sign between a number and a letter or between letters, $5y$, $25x^{-6}$ and $m^4n^{-3}$, the number written first — [[OpenStax Prealgebra 2e, section 10.5]].
- **Elsewhere:** a centred dot between numbers and between a number and a power, $4 \cdot 2^{-1}$, $-1 \cdot 3^{-2}$ and $4 \cdot 2 \cdot 10^5 \cdot 10^{-7}$, and between powers of letters, $m^{-1} \cdot n^{-5}$, including in the laws, $a^m \cdot a^n = a^{m+n}$; brackets as the multiplication sign, $(m^4n^{-3})(m^{-5}n^{-2})$ and $2(-5)$ — [[OpenStax Prealgebra 2e, section 10.5]].
- **Same:** no sign between a number and a letter, $2x$, $6x^2$ and $14x^3$, the number written first; a number or monomial against a bracket with no sign, $2(x + 7)$, $x(6x + 5)$ and $-4a(a - 4)$ — [[OpenStax Prealgebra 2e, section 10.6]].
- **Elsewhere:** a centred dot between numbers, $24 = 12 \cdot 2$ and $36 = 12 \cdot 3$, and between a factor and what it multiplies when a term is rewritten as a product, $2 \cdot x + 2 \cdot 7$ and $x \cdot 6x + x \cdot 5$; the letter x and an asterisk as the sign in its figures' `alt` text only, "2 x 2 x 2 x 3", "5*x" and "3*3*y" — [[OpenStax Prealgebra 2e, section 10.6]].

### Decimal point and digit groups

- **This Wiki:** a decimal point, $2.5$. Digits of a long number are grouped in threes with a thin space, $12\,345.678$.
- **Same:** a decimal point, $0.25$ — [[OpenStax Calculus Volume 1, section 2.2]].
- **Same:** a decimal point, $9.25$ — [[OpenStax Prealgebra 2e, section 7.3]].
- **Same:** a decimal point, $3.4x$ and $0.24$ — [[OpenStax Prealgebra 2e, section 8.3]].
- **Same:** a decimal point, $0.04$, $0.28$ and $3.5$ — [[OpenStax Prealgebra 2e, section 9.7]].
- **Same:** a decimal point, $0.74$, $0.5476$ and $1.05$ — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** a decimal comma, $2{,}5$ — much of continental Europe and South America.
- **Elsewhere:** a comma between groups, $12{,}345$ — UK and US everyday print. It reads as a decimal comma to a European reader, which is why this Wiki uses a space (the SI recommendation).
- **Elsewhere:** a comma between groups, $10{,}000$ — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** a comma between groups, $2{,}100$ and $19{,}400$ — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** a comma between groups in a money amount, $\$1{,}506$, while the same number in the equation is written $1506$ — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** a comma between groups in money amounts, $\$5{,}600$ and $\$20{,}000$, and in an image's answer line, $20{,}000 = P$, while the same amount in the equation is written $5600$ — [[OpenStax Prealgebra 2e, section 9.7]].
- **Elsewhere:** a comma between groups, $15{,}625$ in a numerical check and $\$40{,}000$ in a money amount — [[OpenStax Prealgebra 2e, section 10.2]].
- **Same:** a decimal point, $0.3$ in $0.3z^2$, the one decimal in the section; no number long enough to group — [[OpenStax Prealgebra 2e, section 10.4]].
- **Same:** a decimal point, $0.004$, $0.0052$, $5.2$ and $0.089$ — [[OpenStax Prealgebra 2e, section 10.5]].
- **Elsewhere:** a comma between groups, $37{,}000$, $10{,}000$, $300{,}000$ and $2{,}598{,}960$ — [[OpenStax Prealgebra 2e, section 10.5]].

### Slope

- **This Wiki:** *slope*, as the Node is named in the Anchor Graph: [[Slope of a straight line]]. Introduce *gradient* once, there, as the same thing.
- **Same:** *slope* — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** *gradient* — UK schools and examinations. University texts reserve *gradient* for a vector, $\nabla f$, which is another reason to keep it out of this Module.

### Intervals

- **This Wiki:** $(a, b)$ excludes both ends, $[a, b]$ includes both, $[a, b)$ includes only $a$.
- **Same:** $(a, c)$ for an open interval — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** reversed square brackets for an excluded end, $]a, b[$ and $[a, b[$ — France and parts of continental Europe. The same $(a, b)$ also names the point with coordinates $a$ and $b$; say which.

### Infinity

- **This Wiki:** $\infty$ and $-\infty$, and an interval with no end on one side is written with a round bracket there: $[2, \infty)$, $(-\infty, 0)$. Infinity is never a number, so $\infty$ never sits inside a square bracket. In an `interactive` block's `span` parameter it is spelled `inf` and `-inf`, as `'[2, inf)'`.
- **Elsewhere:** none known.

### Inverse trigonometric functions

- **This Wiki:** $\arcsin x$, $\arccos x$, $\arctan x$. A power of a trigonometric function is $\sin^2 x$, meaning $(\sin x)^2$.
- **Elsewhere:** $\sin^{-1} x$ for $\arcsin x$ — UK and US school texts and calculator keys. It is not $(\sin x)^{-1}$, though $\sin^2 x$ is $(\sin x)^2$: the reason this Wiki avoids it.

### Tangent

- **This Wiki:** $\tan x$, and $\cot x$ for its reciprocal.
- **Elsewhere:** $\operatorname{tg} x$ and $\operatorname{ctg} x$ — Russian and much of Central and Eastern European school mathematics.

### Function notation

- **This Wiki:** $f(x)$ is the output of the function $f$ at the input $x$, and its graph is $y = f(x)$. These brackets are not multiplication.
- **Same:** $f(x)$, and $y = f(x)$ for the graph — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** $f : x \mapsto 2x + 1$ for the rule itself — UK A-level texts.

### Piecewise definitions

- **This Wiki:** one brace, each piece's rule then *if* and its condition: $f(x) = \begin{cases} x + 1 & \text{if } x < 2 \\ x^2 - 4 & \text{if } x \geq 2 \end{cases}$
- **Same:** a brace, with *if* before each condition — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** a comma or *for* in place of *if* — many university texts. Same meaning.

### Limit

- **This Wiki:** $\lim_{x \to a} f(x) = L$, read "the limit of $f(x)$ as $x$ approaches $a$ is $L$". On the way, $x$ is never equal to $a$.
- **Same:** $\lim_{x \to a} f(x) = L$ — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** $f(x) \to L$ as $x \to a$ — university analysis texts. Same meaning, no $\lim$.

### One-sided limits

- **This Wiki:** $\lim_{x \to a^-} f(x)$ is the limit *from the left*, through $x < a$, and $\lim_{x \to a^+} f(x)$ the limit *from the right*, through $x > a$. The Node is [[Left-hand and right-hand limits]].
- **Same:** $x \to a^-$ and $x \to a^+$, "from the left" and "from the right" — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** $x \uparrow a$ and $x \downarrow a$ — some university analysis texts.
- **Elsewhere:** $x \to a - 0$ and $x \to a + 0$ — Russian and much of Central and Eastern European mathematics.

### A limit that does not exist

- **This Wiki:** say so in words, "the limit does not exist", and say how it fails: the two sides disagree, the values never settle, or they grow without bound. For the last, write $\lim_{x \to a} f(x) = \infty$ or $-\infty$, and still say no limit exists: $\infty$ is not a number.
- **Elsewhere:** DNE written after the limit, $\lim_{x \to 0} \sin(1/x)$ DNE — [[OpenStax Calculus Volume 1, section 2.2]].
- **Elsewhere:** $+\infty$ with its sign always written, and an infinite limit never written DNE — [[OpenStax Calculus Volume 1, section 2.2]].

### Distributive law

- **This Wiki:** (proposed by the Source Curator, for the author to decide) the *distributive law*, $a(b + c) = ab + ac$, as the Node is named: [[Distributive law, expansion, and like terms]]. Applying it to remove brackets is to *expand*: expand $3(x + 4)$ to get $3x + 12$.
- **Elsewhere:** *the Distributive Property*, capitalised, and *distribute* for the step that removes brackets — [[OpenStax Prealgebra 2e, section 7.3]].
- **Elsewhere:** *the Distributive Property*, capitalised, and *distribute* for the step that removes brackets — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** *the Distributive Property*, capitalised, stated in both directions, $a(b + c) = ab + ac$ "used to multiply" and $ab + ac = a(b + c)$ "used to factor", and applied "in reverse" to factor $2x + 14$ as $2(x + 7)$; *multiply* for the step that removes brackets, "Check by multiplying the factors", with *distribute* not appearing in its prose — [[OpenStax Prealgebra 2e, section 10.6]].

### Like terms

- **This Wiki:** (proposed by the Source Curator, for the author to decide) *like terms* are terms with the same letters to the same indices, and adding them up is to *collect like terms*: $9y + 3y + 17 - 2 = 12y + 15$.
- **Elsewhere:** *combine like terms* — [[OpenStax Prealgebra 2e, section 7.3]].
- **Elsewhere:** *combine like terms*, defined as "terms that are either constants or have the same variables with the same exponents", combined by "add the coefficients of the like terms" — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** *combine like terms* — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** *combine like terms*: "when you combine like terms by adding and subtracting, you need to have the same base with the same exponent" — [[OpenStax Prealgebra 2e, section 10.2]].

### The negative of an expression

- **This Wiki:** (proposed by the Source Curator, for the author to decide) $-a$ is *the negative of* $a$, or *minus* $a$, and $-(y + 5)$ is the negative of the bracket, expanded as multiplication by $-1$: $-(y + 5) = -y - 5$.
- **Same:** *the negative* for the minus in $8 - 2(3y + 5)$, "Be careful when distributing the negative"; $-(x + 5)$ expanded to $-x - 5$ by distributing, and $-x = 12$ solved by multiplying both sides by $-1$ — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** *the opposite of* an expression for $-(y + 5)$, with $-a = -1 \cdot a$ — [[OpenStax Prealgebra 2e, section 7.3]].
- **Elsewhere:** *the opposite*, "we raise only the $3$ to the 4th power and then find the opposite", for the minus in $-3^4 = -(3 \cdot 3 \cdot 3 \cdot 3)$ — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** *the opposite*, "find the opposite of $3^{-2}$", for the minus in $-3^{-2}$, with "Rewrite as a product with $-1$", $-1 \cdot 3^{-2}$; and a fraction's sign moved to the front by $\frac{a}{-b} = -\frac{a}{b}$ — [[OpenStax Prealgebra 2e, section 10.5]].
- **Same:** *the negative*, "we factor the negative out as part of the GCF" and "the GCF will be negative", for $-9$ in $-9y - 27 = -9(y + 3)$ and $-4a$ in $-4a^2 + 16a = -4a(a - 4)$, the GCF first found "ignoring the signs of the terms" — [[OpenStax Prealgebra 2e, section 10.6]].

### Commutative law

- **This Wiki:** (proposed by the Source Curator, for the author to decide) the *commutative law* of addition, $a + b = b + a$, and of multiplication, $ab = ba$: the reason terms may be reordered before collecting like terms, and $m \cdot 4$ written $4m$.
- **Elsewhere:** *the Commutative Property of Addition*, capitalised — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** *the Commutative Property*, capitalised and unqualified, "Use the Commutative Property to rearrange the factors", for reordering a product, $4 \cdot (-5) \cdot x^2 \cdot x^3$ — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** *the Commutative Property*, capitalised and unqualified, "Use the Commutative Property to get like bases together" and "Use the Commutative Property to rearrange the factors", for reordering a product — [[OpenStax Prealgebra 2e, section 10.5]].

### Term, coefficient and constant

- **This Wiki:** (proposed by the Source Curator, for the author to decide) an expression is made of *terms*, each added or subtracted, with the sign before a term going with it: $2x + 7y - 4$ has terms $2x$, $7y$ and $-4$. The number multiplying the letters in a term is its *coefficient*, $9$ in $9a$ and $1$ in $y$. A term with no letter, $7$, is a *constant term*, or a *constant*.
- **Same:** *term*, *coefficient* and *constant*, with *constant term* for a term with no variable, and "the operation before a term" included with it — [[OpenStax Prealgebra 2e, section 2.2]].
- **Same:** *variable terms* and *constant terms*, or *constants*, and *the coefficient of the variable*, which the last step of solving makes $1$ — [[OpenStax Prealgebra 2e, section 8.3]].
- **Same:** "a coefficient of $1$", "the $y$-term" and "the term with $y$", "Divide $5$ to make the coefficient $1$", and "all the other variables and constants" — [[OpenStax Prealgebra 2e, section 9.7]].
- **Elsewhere:** *constants* for the numerical factors of a product, "Multiply the constants and add the exponents" for $36 \cdot 4 \cdot n^2 \cdot n^3$, where this Wiki's line would say coefficients; and *monomial* for a one-term expression such as $4x^2$ — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** *monomial* for a one-term expression such as $56x^5$, and *the number part* and *the variable part* of a monomial, "Use fraction multiplication to separate the number part from the variable part", where this Wiki's line would say coefficient and letters — [[OpenStax Prealgebra 2e, section 10.4]].
- **Same:** *coefficients*, "If the monomials have numerical coefficients, we multiply the coefficients", for the $2$ and $-5$ in $(2x^{-6}y^8)(-5x^5y^{-3})$ — [[OpenStax Prealgebra 2e, section 10.5]].
- **Elsewhere:** *monomial* for a one-term expression such as $2x^{-6}y^8$ — [[OpenStax Prealgebra 2e, section 10.5]].
- **Same:** *term*, "the GCF of all the terms of the polynomial"; *coefficient*, "Factor each coefficient into primes", and *leading coefficient* defined as "the coefficient of the first term"; *constants* for bare numbers, "the greatest common factor of constants" — [[OpenStax Prealgebra 2e, section 10.6]].
- **Elsewhere:** *polynomial*, *monomial*, *binomial* and *trinomial* for expressions by their number of terms, "multiply a polynomial by a monomial", "factor a variable from a binomial" and "factor the greatest common factor from a trinomial" — [[OpenStax Prealgebra 2e, section 10.6]].

### Evaluate and substitute

- **This Wiki:** (proposed by the Source Curator, for the author to decide) to *evaluate* an expression *at* a value is to *substitute* that value for the letter and work out the result: evaluate $x + 7$ at $x = 3$ to get $10$. Write *at* $x = 3$, not *when*.
- **Elsewhere:** "Evaluate $x + 7$ when $x = 3$", "substitute $3$ for $x$", and the result "has a value of $10$" — [[OpenStax Prealgebra 2e, section 2.2]].
- **Elsewhere:** "Let $x = -5$" and "Substitute $7$ for $x$" when checking a solution, never *at* — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** "Substitute in the given information", "Substitute any given values", and *when* for the values taken, "when $d = 520$ and $r = 65$", never *at* — [[OpenStax Prealgebra 2e, section 9.7]].

### Equation, solution and solve

- **This Wiki:** (proposed by the Source Curator, for the author to decide) an *equation* is two expressions joined by $=$, and a *solution* is a value of the unknown that makes it true. To *solve* an equation is to find every solution, written as $x = -3$. A solution is *checked* by substituting it into the original equation and working out both sides; this Wiki writes the check as two values that agree, $-14 = -14$, and does not write a question mark over the equals sign. The two sides are *the left-hand side* and *the right-hand side*.
- **Elsewhere:** *linear equation*; *solve* as the instruction, "The solution is $x = -3$", and a *check* that substitutes the solution into the original equation until "the result is a true statement", written in its images with a question mark over the equals sign, $\overset{?}{=}$, and a tick after the last line; *the variable side* and *the constant side* for the two sides — [[OpenStax Prealgebra 2e, section 8.3]].
- **Elsewhere:** *solve the formula for $t$* and *isolate*, "We will isolate $a$ on one side of the equation"; *equation* and *formula* used interchangeably for $3x + y = 10$; a *check* that substitutes "the numbers into the formula" until "the result is a true statement", written in its MathML with a question mark over the equals sign, $520 \overset{?}{=} 65 \cdot 8$, and a tick after the last line — [[OpenStax Prealgebra 2e, section 9.7]].
- **Elsewhere:** a numerical check of a law rather than of a solution, written in its MathML with a question mark over the equals sign and a tick after the last line, $2^2 \cdot 2^3 \overset{?}{=} 2^{2+3}$, $4 \cdot 8 \overset{?}{=} 2^5$, $32 = 32$ — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** a numerical check of a law rather than of a solution, written in its MathML with a question mark over the equals sign and a tick after the last line, $\frac{3^4}{3^2} \overset{?}{=} 3^{4-2}$, $\frac{81}{9} \overset{?}{=} 3^2$, $9 = 9$ — [[OpenStax Prealgebra 2e, section 10.4]].
- **Elsewhere:** a check of a factorisation rather than of a solution, "Check by multiplying the factors", written as a column of expressions with a tick after the last, $x(6x + 5)$, $x \cdot 6x + x \cdot 5$, $6x^2 + 5x$, with no equals sign and no question mark; most checks are images whose `alt` text says "confirmed with a checkmark" — [[OpenStax Prealgebra 2e, section 10.6]].

### Properties of equality

- **This Wiki:** (proposed by the Source Curator, for the author to decide) *do the same to both sides*: adding, subtracting, multiplying by or dividing by the same number on both sides of an equation keeps it true, dividing by $0$ excepted. Say the step, "subtract $6$ from both sides", and do not name a property.
- **Same:** no property named, only the step: "Subtract $b$ and $c$ from both sides to isolate $a$", "Subtract $3x$ from both sides", "Divide to isolate $t$", "Clear the fractions" — [[OpenStax Prealgebra 2e, section 9.7]].
- **Elsewhere:** *the Subtraction Property of Equality*, *Addition*, *Multiplication* and *Division Property of Equality*, capitalised, one for each operation done to both sides — [[OpenStax Prealgebra 2e, section 8.3]].

### Inverse operation

- **This Wiki:** (proposed by the Source Curator, for the author to decide) subtraction is the *inverse operation* of addition, and division of multiplication; a step that applies one to remove the other *undoes* it: subtracting $6$ undoes adding $6$. The Node is [[Inverse operations]].
- **Elsewhere:** *undo*, in quotation marks, "We must 'undo' adding $6$ by subtracting $6$", without the word *inverse* — [[OpenStax Prealgebra 2e, section 8.3]].

### Formula and its subject

- **This Wiki:** (proposed by the Source Curator, for the author to decide) a *formula* is an equation relating letters that each stand for a quantity, $d = rt$. The letter alone on one side is its *subject*, and to *rearrange* a formula is to *make another letter the subject*, treating the remaining letters as if they were numbers: rearranged to make $t$ the subject, $d = rt$ becomes $t = \frac{d}{r}$. The Node is [[Equations and rearranging formulas]].
- **Elsewhere:** *solve the formula for $t$*, "the formula $t = \frac{d}{r}$ is solved for $t$", and *solving a literal equation*; the result is "another formula, made up only of variables", whose letters it also calls *literals*; *in general* for the rearranged formula against *when* for a numerical case — [[OpenStax Prealgebra 2e, section 9.7]].

### Speed and rate

- **This Wiki:** (proposed by the Source Curator, for the author to decide) *speed* for distance per unit time, as the Node is named: [[Ratios, proportion, units, and average speed]]. *Rate* alone is any quantity per unit of another, so say *speed* when that is what is meant: distance $=$ speed $\times$ time.
- **Elsewhere:** *rate* for speed, "a uniform (constant) rate", "a steady rate of $65$ miles per hour", "mph", and $r$ for it in $d = rt$; *speed* appears once, in an exercise — [[OpenStax Prealgebra 2e, section 9.7]].

### Index laws by name

- **This Wiki:** (proposed by the Source Curator, for the author to decide) the three multiplication laws are the *product rule*, $a^m a^n = a^{m+n}$, *power of a power*, $(a^m)^n = a^{mn}$, and *power of a product*, $(ab)^m = a^m b^m$, written without a multiplication sign; together with the laws for quotients, zero, negative and fractional indices they are the *index laws*, as the Node is named: [[Index laws and fractional powers]].
- **Elsewhere:** *the Product Property of Exponents*, *the Power Property of Exponents* and *the Product to a Power Property of Exponents*, capitalised, the last also called *the Power of a Product Property* in the same section; collectively *the Properties of Exponents*; written with a centred dot, $a^m \cdot a^n = a^{m+n}$ and $(a^m)^n = a^{m \cdot n}$, but $(ab)^m = a^m b^m$ without one — [[OpenStax Prealgebra 2e, section 10.2]].
- **Elsewhere:** *the Quotient Property of Exponents*, stated in two forms by which index is larger, $\frac{a^m}{a^n} = a^{m-n}$ for $m > n$ and $\frac{a^m}{a^n} = \frac{1}{a^{n-m}}$ for $n > m$, never with a negative index; *Zero Exponent* as a definition, "Zero Exponent Definition", also "the Zero Exponent Property" and "Zero power property"; *the Quotient to a Power Property of Exponents*, $\left(\frac{a}{b}\right)^m = \frac{a^m}{b^m}$; *the Quotient Rule* and *the Product to a Power Rule* once each; collectively *the Properties of Exponents*, all capitalised — [[OpenStax Prealgebra 2e, section 10.4]].
- **Elsewhere:** *Negative Exponent* as a definition, "the definition of a negative exponent" and *Definition of Negative Exponent*, $a^{-n} = \frac{1}{a^n}$ for a positive integer $n$ and $a \ne 0$, said as "taking the reciprocal of the base and then changing the sign of the exponent"; *the Quotient Property of Exponents* in one form for integers $m$, $n$, $\frac{a^m}{a^n} = a^{m-n}$; a *Summary of Exponent Properties* naming *Product Property*, *Power Property*, *Product to a Power Property*, *Quotient Property*, *Zero Exponent Property*, *Quotient to a Power Property* and *Definition of Negative Exponent*, all capitalised, written with a centred dot, $a^m \cdot a^n = a^{m+n}$; and one worked example that calls $(k^3)^{-2} = k^{3(-2)}$ "the Product to a Power Property" where the law used is $(a^m)^n = a^{m \cdot n}$ — [[OpenStax Prealgebra 2e, section 10.5]].

### Division restriction

- **This Wiki:** (proposed by the Source Curator, for the author to decide) a value a letter may not take is written with $\ne$ after the statement, set off by a comma, $\frac{a^m}{a^n} = a^{m-n}, \; a \ne 0$, and said in prose as *for $a \ne 0$* or *where $a$ is not zero*, hyphenating *non-zero*. A letter in a denominator is taken to be non-zero, and the Note that introduces the expression says so once. The Node is [[Division restrictions]].
- **Same:** $a \ne 0$ and $b \ne 0$ set off by a comma in each boxed law, $a^0 = 1, \; a \ne 0$; *non-zero* hyphenated, "If $a$ is a non-zero number", but also *nonzero* and "is not zero", "In this text, we assume any variable that we raise to the zero power is not zero" — [[OpenStax Prealgebra 2e, section 10.4]].
- **Same:** $a \ne 0$ and $b \ne 0$ set off by a comma in each boxed statement, "If $n$ is a positive integer and $a \ne 0$, then $a^{-n} = \frac{1}{a^n}$" and $\frac{a^m}{a^n} = a^{m-n}, \; a \ne 0$; no prose word for it, neither *non-zero* nor *nonzero*, appears, and the summary lists $a^{-n} = \frac{1}{a^n}$ with no restriction — [[OpenStax Prealgebra 2e, section 10.5]].
- **Elsewhere:** none known.

### Cancelling common factors

- **This Wiki:** (proposed by the Source Curator, for the author to decide) to *cancel* a factor common to the numerator and denominator of a fraction is to divide both by it, $\frac{14}{21} = \frac{2}{3}$ and $\frac{x^5}{x^2} = x^3$, giving an *equivalent fraction*; say *cancel*, not *divide out* or *reduce*. The Node is [[Equivalent fractions and cancellation]].
- **Elsewhere:** *dividing out common factors* "using the Equivalent Fractions Property", $\frac{a}{b} = \frac{a \cdot c}{b \cdot c}$ and $\frac{a \cdot c}{b \cdot c} = \frac{a}{b}$, with a $1$ written in place of the factors removed, $\frac{x \cdot x \cdot x \cdot x \cdot x}{x \cdot x \cdot 1}$; the word *cancel* does not appear — [[OpenStax Prealgebra 2e, section 10.4]].
- **Elsewhere:** *dividing out common factors*, "We can also simplify $\frac{x^2}{x^5}$ by dividing out common factors", with the factors crossed out in red in a figure ("Two x's are crossed out in red on the top and on the bottom"); the word *cancel* does not appear — [[OpenStax Prealgebra 2e, section 10.5]].

### Division sign and quotient

- **This Wiki:** (proposed by the Source Curator, for the author to decide) a quotient of expressions is written as a stacked fraction, $\frac{56x^5}{7x^2}$, and *divide* is the instruction; $\div$ appears only between two numbers in arithmetic, $12 \div 4$, and $/$ not at all in displayed mathematics. The result of a division is its *quotient*.
- **Elsewhere:** $\div$ between two monomials, $56x^5 \div 7x^2$ and $48b^8 \div 6b^2$, with *Find the quotient* as the instruction and "Rewrite as a fraction" as the first step; a quotient already stacked, $\frac{42x^2y^3}{-7xy^5}$, is given the same instruction — [[OpenStax Prealgebra 2e, section 10.4]].
- **Same:** a quotient written as a stacked fraction, $\frac{r^5}{r^{-4}}$ and $\frac{9 \times 10^3}{3 \times 10^{-2}}$, with *Simplify* or *Divide* as the instruction; $\div$ does not appear — [[OpenStax Prealgebra 2e, section 10.5]].

### Absolute value

- **This Wiki:** (proposed by the Source Curator, for the author to decide) $|x|$ is the *absolute value* of $x$, its distance from $0$ on the number line, so $|{-3}| = 3$ and $|3| = 3$; read "the absolute value of $x$", and say *size* or *magnitude* only in prose. The Node is [[Absolute value, intervals, and inequalities]].
- **Same:** $|n|$ for the number of places to move a decimal point when the index $n$ is negative, "move the decimal point $|n|$ places to the left", used once in a procedure and never named — [[OpenStax Prealgebra 2e, section 10.5]].
- **Elsewhere:** none known.

### Factorise and highest common factor

- **This Wiki:** (proposed by the Source Curator, for the author to decide) to *factorise* an expression is to write it as a product, and the result is its *factorised form*; *factor* is a noun only, never the verb. The largest expression that is a factor of every term is their *highest common factor*, abbreviated *HCF*, and the step that writes $2x + 14$ as $2(x + 7)$ is to *take out the HCF*, or *take out the common factor*. The other is the *lowest common multiple*, *LCM*. The Nodes are [[Factorisation]], [[Factors and multiples]] and [[Common factors, quadratics, and difference of squares]].
- **Elsewhere:** *factor* as the verb, "Splitting a product into factors is called factoring", with *Factor:* as the instruction and *factor the greatest common factor from a polynomial* for taking it out; *greatest common factor*, abbreviated *GCF*, "the largest expression that is a factor of all the expressions"; *factored form* for the result; and *least common multiple (LCM)* in its one backward reference — [[OpenStax Prealgebra 2e, section 10.6]].
- **Elsewhere:** *factor* as the verb and *greatest common factor*, *GCF* — US school and college texts generally.
