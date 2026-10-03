# House style

These rules make every Note in the Wiki sound like one writer wrote it. They apply to the
prose a writer adds to a Note: `## In one sentence`, `## Why you need this`, `## The idea`,
`## Worked example` and `## Common mistakes`, plus the `caption` of an Interactive. They do
not cover generated blocks, which no writer touches. Each rule says what to write and how to
tell whether you have.

## Spelling: British English

Use British spelling and the words British schools use: *factorise*, *recognise*, *centre*,
*behaviour*, *modelling*, *maths*. Where a word has an *-ise* and an *-ize* form, write
*-ise*. Mathematical terms follow the notation authority (below), which settles words such as
*brackets* and *index*.

## Voice: second person, present tense

Speak to the learner as *you*, and describe the mathematics as happening now. Write "You can
factorise this", not "One may factorise this", "We factorise this" or "This was factorised".
Steps are instructions or present-tense statements: "Subtract 3 from both sides", "The
bracket expands to $2x + 6$".

## Order: define before use

Every term and symbol is defined at or before its first use. A term counts as defined when
one of these holds:

- the Note defines it earlier in its own prose;
- it is the subject of a prerequisite, a Note the Note builds on;
- it is 8th-grade arithmetic, the Floor the Module assumes.

Anything else is a forward reference. The one allowed form is a marked Cross-reference: a
wikilink to the other Note, in a sentence that tells the reader it is an aside they can skip,
such as "You meet this again in [[Limits]]." The Note's own explanation never depends on it.

## Banned words

*simply*, *just*, *obviously*, *clearly*, *trivially*, and their adjectives (*simple*,
*obvious*, *clear*, *trivial*) whenever they say how easy a step is. To a learner who is
stuck, each one says the step is easy and the trouble is theirs, and it carries no
information. Delete the word. If the sentence then feels thin, the step needs explaining:
show the working instead. The words stay allowed where they say nothing about difficulty:
*simplest form*, *clear the fractions*, *just under 2*.

## Worked example: numbers first

Every worked example works through specific numbers before it states anything general. The
first lines of `## Worked example` use numbers such as $3$, $-2$ or $\frac{1}{4}$, with every
step shown. A general form in letters, if the Note gives one, comes after, and is read off
the worked numbers. A worked example that opens with letters breaks this rule.

## Common mistakes: the mistake, then why

`## Common mistakes` lists mistakes learners actually make. Each entry has two parts:

1. **The mistake, as the learner makes it**: the wrong working or the wrong belief, in their
   terms. "Writing $(a + b)^2 = a^2 + b^2$", or "Thinking a negative times a negative is
   negative".
2. **Why it is wrong**: a counterexample with numbers, or the reason the step fails, and the
   correct version.

The section is not a list of rules ("Always remember to…", "Never…"), tips, or warnings with
no wrong working attached. If you cannot write down the wrong working, it is not an entry.

## Notation: follow the notation authority

`wiki/Conventions.md` decides which symbol and which word you write. Look up every symbol
and term there before writing it, and write its **This Wiki** form. Where its **Elsewhere**
lines say another convention would trip a learner up, the Note that introduces the idea says
so once, attributing each convention to who uses it. Wherever two sources disagree on a
convention, both claims appear with their sources, and the Note does not pick one silently.
If the Note needs a symbol or term the notation authority does not cover, write the form
British school texts use and report the gap when you hand the Note back, so an entry can be
added.

## Length

`## In one sentence` is exactly one sentence. It is copied into other Notes and briefings
on its own, so it names its subject rather than saying "this Note".

A Note that is not a Floor Note runs to 400–900 words of prose across the five sections this
file covers. A Floor Note, one that requires nothing, may be shorter, and keeps to the 900
ceiling. Count words of prose only: leave out display mathematics, `interactive` blocks and
generated blocks. Under 400 words, the Note has left something unexplained. Over 900, it is
teaching more than its one idea: cut back to it.
