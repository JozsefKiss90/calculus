# LaTeX is restricted to the KaTeX-supported subset

All mathematics in Notes is written in the subset of LaTeX that KaTeX supports. The health script validates every `$…$` and `$$…$$` block against KaTeX and fails the build on a reject.

## Consequences

The reason is a dialect mismatch that is otherwise invisible until far too late. **Obsidian renders maths with MathJax; the leading app renderer, Mafs, renders it with KaTeX.** MathJax accepts macros KaTeX rejects, so a formula can render perfectly in Obsidian — where it is authored, reviewed and approved — and then silently fail or mis-render on the Page. Because every Note must be correct in Obsidian *and* generate a correct Page, the binding constraint is the intersection of the two dialects, which is KaTeX.

Validating at authoring time rather than at render time matters more than the choice of subset. A broken formula caught by the script is a failed build; the same formula caught in the app is teaching material that was marked `reviewed` while being wrong. Silently mis-rendered mathematics is the worst class of defect this project can ship, and it is the one a human reviewer is least likely to catch, because the Obsidian preview they are reading looks right.

The rejected alternative was to pick a MathJax-based renderer for the app so both sides match. It solves the problem, but it decides the app's rendering stack now, which ADR-0004 deliberately deferred — trading a cheap, checkable constraint for a locked-in one.

Expect to be told a macro "works fine" because it works in Obsidian. That is the failure mode this ADR exists to prevent, not a counterexample to it.
