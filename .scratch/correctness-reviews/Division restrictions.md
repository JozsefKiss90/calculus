# Correctness review: Division restrictions

**Status:** ready-for-human

**Note:** [[Division restrictions]] (`wiki/algebra/Division restrictions.md`)

## Review 1

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

### Findings

#### 1. untaught: solving an equation by doing the same to both sides

- **Where:** `## The idea`, the method: "2. Solve that equation. Each solution is an excluded value." And `## Worked example`: "Add $3$ to both sides:", "Subtract $5$ from both sides:", "Divide both sides by $2$:", with the same steps in the `expression-stepper` block ("Subtract 5 from both sides.", "Divide both sides by 2."). `## Common mistakes` relies on it too: "Solving $x + 6 = 0$ gives $x = -6$".
- **What is wrong:** The method's central step is solving the equation "denominator $= 0$", and the Note does it by the balance method, doing the same operation to both sides of an equation. That is the subject of [[Equations and rearranging formulas]], which is in the Bundle's Not taught before it list. The Note does not teach the method itself: it uses "add $3$ to both sides" as a step the learner already knows. Being a Floor Note does not clear it, since the Floor licence covers only the other Floor Nodes, and this Node is above the Floor. The arithmetic itself is right: $x - 3 = 0$ gives $x = 3$, $2x + 5 = 0$ gives $x = -\frac{5}{2}$, and the check $2 \times \left(-\frac{5}{2}\right) + 5 = 0$ holds.
- **Taught where:** [[Equations and rearranging formulas]], an above-Floor Node (it requires the Floor Node [[Inverse operations]], per that sibling's Required by list), so it is not below this Floor Node. This may be an Anchor Graph fault: as specified, the method "set the denominator to $0$ and solve" cannot be taught without equation solving, and nothing in this Node's closure teaches it.
- **What would fix it:** Find each excluded value by undoing operations rather than by the balance method, which the Floor sibling [[Inverse operations]] licenses. For example: "$x - 3$ is $0$ when $x$ is the number that gives $0$ after $3$ is taken away. Undo the subtraction: $0 + 3 = 3$." and "$2x + 5$ is $0$ when $2x$ is $-5$, so $x = -5 \div 2 = -\frac{5}{2}$." Apply the same to the stepper `because` lines and the $x + 6$ mistake. Alternatively, the author triages whether this Node should require [[Equations and rearranging formulas]], which would take it off the Floor.

#### 2. query: substituting a value for a letter

- **Where:** Throughout, for example `## Worked example`: "Check it by substituting $3$:" and `## The idea`: "you cannot substitute it".
- **What is wrong:** Possibly nothing. The Not taught before it list contains "Variables, substitution, and brackets", and replacing a letter by a number is the Note's whole working. The name reads like a grouping Node over Floor Nodes such as [[Signed arithmetic and order of operations]], and every written Layer 0 sibling also substitutes into expressions with letters, so I have not raised it as `untaught`. The Bundle does not say what that Node teaches or whether it lies above the Floor, so I could not settle it.
- **What would fix it:** A human confirms whether "Variables, substitution, and brackets" is a grouping Node whose idea the Floor already assumes. If it is a teaching Node above the Floor, this becomes an `untaught` finding for this Note and its siblings alike.

## Review 2

**Date:** 2026-10-03

**Outcome:** 1 blocking finding, so `reviewed_by` stays `none`.

Review 1's finding 1 is cleared: the Note now finds each excluded value by undoing operations from $0$, last step first, which the Floor sibling [[Inverse operations]] licenses, and no step is done "to both sides". I redid every calculation and each is right: $\frac{4}{0}$ at $x = 3$; $\frac{6}{2} = 3$ at $x = 5$; $\frac{0}{-4} = 0$ at $x = -1$; $0 - 5 = -5$, $-5 \div 2 = -\frac{5}{2}$ and $2 \times \left(-\frac{5}{2}\right) + 5 = 0$; $0 - 2 = -2$ for $x + 2$; $\frac{0}{5}$ at $x = 4$ and $0 - 1 = -1$ for $x + 1$; $6 + 6 = 12$ and $-6 + 6 = 0$ for $x + 6$; and if $5 \div 0$ were $0$, then $0 \times 0$ would be $5$, which it is not. Each counterexample in `## Common mistakes` breaks the wrong working. No contradiction with a Layer sibling was found: [[Equivalent fractions and cancellation]] ("The denominator is never $0$"), [[Multiplication, division, squares, and roots]] ("You can never divide by $0$") and [[Inverse operations]] ("dividing by $0$ has no meaning") all agree with it. No `unsourced` finding applies, since this is a Floor Node.

### Findings

#### 1. error: "a zero numerator makes the fraction 0" is stated for every fraction, and the Note's own $\frac{0}{0}$ breaks it

- **Where:** `## The idea`: "A fraction with $0$ as its numerator is $0$; a fraction with $0$ as its denominator is undefined." And, later in the same section: "A zero numerator makes the whole fraction $0$, which is a perfectly good value."
- **What is wrong:** Both sentences say a zero numerator always gives $0$. That is false when the denominator is also $0$: $\frac{0}{0}$ has a zero numerator and is undefined, as the Note itself shows in its $0 \div 0$ bullet. The Note's own last common mistake is a counterexample: $\frac{x - 3}{x - 3}$ at $x = 3$ has numerator $3 - 3 = 0$, and the fraction is $\frac{0}{0}$, not $0$. As written, the first sentence gives $\frac{0}{0}$ two verdicts at once, $0$ and undefined. This is the case [[Simplifying before taking a limit]] goes on to use, so the condition matters.
- **What would fix it:** Add the condition to both sentences, for example "A fraction with $0$ as its numerator and a non-zero denominator is $0$" and "A zero numerator, over a denominator that is not zero, makes the whole fraction $0$".

#### 2. query: substituting a value for a letter (carried over from Review 1, finding 2)

- **Where:** Throughout, for example `## Worked example`: "Check it by substituting $3$:" and `## The idea`: "you cannot substitute it".
- **What is wrong:** Possibly nothing, but it is still unresolved, and `## Comments` holds no answer. "Variables, substitution, and brackets" is in the Bundle's Not taught before it list, which the Bundle describes as "Every Node of the Module above the Floor", and replacing a letter by a number is the Note's whole working. If that Node teaches substitution, rather than grouping Floor Nodes, this is `untaught` for this Note and for the siblings that substitute too, and it is an Anchor Graph fault, because a Note about values a letter cannot take cannot be written without letters. The Bundle does not say which it is, so I could not settle it.
- **What would fix it:** A human confirms what "Variables, substitution, and brackets" teaches and whether it lies above the Floor, before sign-off.

#### 3. query: the method in `## The idea` is stated for every expression, but works only when the letter appears once in the denominator

- **Where:** `## The idea`: "To find the excluded values of an expression:" followed by "2. Find that value by working backwards from $0$, undoing each step the denominator does to the letter, the last step first."
- **What is wrong:** Nothing the Note works is wrong, since every denominator in it is a chain of steps on one $x$. As a general method, though, it fails for denominators the learner meets next. For $x^2 - 4$, undoing gives $0 + 4 = 4$, then $\sqrt{4} = 2$, which misses $x = -2$ (as [[Inverse operations]] warns). For $x(x + 2)$ the letter appears twice, and there is no single chain of steps to undo. The general sentence at the end of `## Worked example` ("find each value of $x$ that makes the denominator $0$") is right as it stands.
- **What would fix it:** Optionally, scope step 2 to denominators where the letter appears once, for example "When the letter appears once in the denominator, find that value by working backwards…", or note that undoing a square gives two values.

## Review 3

**Date:** 2026-10-03

**Outcome:** No blocking finding, so `reviewed_by` is now `agent`. Human sign-off is next.

Review 2's finding 1 is cleared: `## The idea` now reads "A fraction with $0$ as its numerator and a non-zero denominator is $0$" and "A zero numerator over a non-zero denominator makes the whole fraction $0$", so $\frac{0}{0}$ no longer gets two verdicts. Review 2's query 3 is addressed: step 2 now says "This works when the letter appears once in the denominator, as in every example here." I redid every calculation and each is right: $4 \times 3 = 12$; $0 \div 6 = 0$; $\frac{4}{0}$ at $x = 3$; $\frac{6}{2} = 3$ at $x = 5$; $\frac{0}{-4} = 0$ at $x = -1$; $0 + 3 = 3$; $0 - 5 = -5$, $-5 \div 2 = -\frac{5}{2}$ and $2 \times \left(-\frac{5}{2}\right) + 5 = 0$, in both the prose and the stepper; $0 - 2 = -2$ for $x + 2$, and $x = 0$ for $x$; $\frac{0}{5}$ at $x = 4$ and $0 - 1 = -1$ for $x + 1$; $6 + 6 = 12$ and $-6 + 6 = 0$ for $x + 6$; $\frac{0}{0}$ at $x = 3$ for $\frac{x - 3}{x - 3}$. Each counterexample in `## Common mistakes` breaks the wrong working. The undoing method is licensed by the Floor sibling [[Inverse operations]], and the one link in the body to an above-Floor Node, [[Simplifying before taking a limit]], is marked as an aside. No contradiction with a Layer sibling: [[Equivalent fractions and cancellation]], [[Multiplication, division, squares, and roots]], [[Inverse operations]] and [[Signed arithmetic and order of operations]] all agree that division by $0$ has no value. No notation departs from Conventions. No `unsourced` finding applies, since this is a Floor Node.

### Findings

#### 1. query: substituting a value for a letter (carried over from Review 1, finding 2, and Review 2, finding 2)

- **Where:** Throughout, for example `## Worked example`: "Check it by substituting $3$:" and `## The idea`: "you cannot substitute it".
- **What is wrong:** Possibly nothing, but `## Comments` still has no answer. "Variables, substitution, and brackets" is in the Bundle's Not taught before it list. If that Node teaches substitution, rather than grouping Floor Nodes, then this Note and the siblings that substitute all use an untaught idea, and that is an Anchor Graph fault. The Bundle does not say which it is, so I have not raised it as blocking.
- **What would fix it:** A human confirms what "Variables, substitution, and brackets" teaches and whether it lies above the Floor, before sign-off.

## Comments
