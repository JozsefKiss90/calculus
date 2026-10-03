# Correctness review: Division restrictions

**Status:** needs-triage

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

## Comments
