# 07: KaTeX subset validation and the notation authority

**What to build:** Mathematics that renders in one tool and breaks in the other cannot land, and notation gains a single authority. `check` enforces invariant 8: every inline and display mathematics expression in every Note parses under KaTeX. That means a real KaTeX dependency in `scripts/`, not a regex — Obsidian renders with MathJax and the likely App renderer with KaTeX, so the binding dialect is the intersection.

Alongside it, `wiki/Conventions.md` is created as the notation authority that the house style and every Note defer to: which symbol and term means what, and where sources disagree, both claims attributed and never silently resolved. It is seeded with the conflicts that bite at the Floor — order-of-operations naming, BIDMAS against PEMDAS, given British English throughout.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] A MathJax-only macro in a Note fails `check` with a non-zero exit and a report naming the Note and the offending expression
- [ ] Valid KaTeX inline and display mathematics passes, and renders in Obsidian
- [ ] Both inline and display forms are validated, and a dollar sign inside a fenced code block is ignored
- [ ] `wiki/Conventions.md` exists with valid frontmatter and records the order-of-operations convention with both namings attributed
- [ ] A convention entry has a fixed shape: the symbol or term, this Wiki's choice, and any conflicting source convention with its attribution
- [ ] The file is short enough to go into a Context Pack whole, and is written to be read by an author mid-sentence
