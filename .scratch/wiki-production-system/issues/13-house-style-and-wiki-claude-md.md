# 13: House style and the vault's CLAUDE.md

**What to build:** The voice, written down once, so sixty Notes by different agents read as one. The house style file carries the spec's drafted rules: British English; second person, present tense; define before use; the banned words and why they are banned; concrete numbers before general forms; what the Common mistakes section is and is not; notation deferring to `wiki/Conventions.md`; the 400 to 900 word target for a non-Floor Note. It is written to be copied into a Context Pack verbatim.

Alongside it, `wiki/CLAUDE.md`: under 200 lines and explicitly scoped to ad-hoc human-directed edits rather than pipeline work, since the Context Pack is the pipeline's authority. Everything structural is referenced, not restated — naming that split is what keeps it from accreting into the reference wiki's 877 lines.

This ticket needs no code and is blocked only by 01, so it runs in parallel with the whole code stream. The author owns the voice.

**Blocked by:** 01

**Status:** ready-for-human

- [ ] The house style rules exist as one file short enough to go into every Context Pack whole
- [ ] Every rule is stated so an agent can comply without being shown an example Note
- [ ] `wiki/CLAUDE.md` is under 200 lines, carries no frontmatter, and states in its opening lines that it governs hand edits and not the pipeline
- [ ] It restates no schema key, no invariant and no style rule — it references them
- [ ] It names what a hand editor must never touch: a generated block, or a prerequisite entry
- [ ] Both files are reviewed by the author before 15 generates a Pack from them
