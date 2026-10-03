# 13: House style and the vault's CLAUDE.md

**What to build:** The voice, written down once, so sixty Notes by different agents read as one. The house style file carries the spec's drafted rules: British English; second person, present tense; define before use; the banned words and why they are banned; concrete numbers before general forms; what the Common mistakes section is and is not; notation deferring to `wiki/Conventions.md`; the 400 to 900 word target for a non-Floor Note. It is written to be copied into a Context Pack verbatim.

Alongside it, `wiki/CLAUDE.md`: under 200 lines and explicitly scoped to ad-hoc human-directed edits rather than pipeline work, since the Context Pack is the pipeline's authority. Everything structural is referenced, not restated — naming that split is what keeps it from accreting into the reference wiki's 877 lines.

This ticket needs no code and is blocked only by 01, so it runs in parallel with the whole code stream. The author owns the voice.

**Blocked by:** 01

**Status:** done

- [x] The house style rules exist as one file short enough to go into every Context Pack whole
- [x] Every rule is stated so an agent can comply without being shown an example Note
- [x] `wiki/CLAUDE.md` is under 200 lines, carries no frontmatter, and states in its opening lines that it governs hand edits and not the pipeline
- [x] It restates no schema key, no invariant and no style rule — it references them
- [x] It names what a hand editor must never touch: a generated block, or a prerequisite entry
- [x] Both files are reviewed by the author before 15 generates a Pack from them

## Comments

Drafted for the author to review; the last criterion stays open until that happens.

**The house style is `docs/house-style.md`, outside the vault.** It is a rule for writers,
not learning content, so it sits with the Archetype catalogue rather than in `wiki/`. It has
no frontmatter and no relative links, so 15 can paste it into a Pack whole. It points at
`wiki/Conventions.md` by path, which the Pack carries too. 762 words.

**Judgements the spec's rules forced, for the author to confirm or reverse:**

- *Banned words* also covers the adjectives (*simple*, *obvious*, *clear*, *trivial*) when
  they describe how easy a step is, and lets *simplest form*, *clear the fractions* and
  *just under 2* through. A strict ban on the five strings would forbid *simplest form*.
- *Define before use* counts a term as defined when the Note defined it earlier, when it is
  a prerequisite's subject, or when it is 8th-grade arithmetic. A marked Cross-reference is
  a wikilink in a sentence that tells the reader they can skip it.
- *Length* counts prose only, not display maths, `interactive` blocks or generated
  blocks. Floor Notes have no lower bound but keep the 900-word ceiling.
- `## In one sentence` names its subject rather than saying "this Note", because it is
  read on its own in other Notes' `## Builds on` and in Packs.
- A symbol `Conventions.md` does not cover is written in the British school form and
  reported back, since no author may edit the notation authority mid-Note.

**`wiki/CLAUDE.md` is 59 lines.** It routes each kind of change to the file that owns its
rule, rather than restating the rule. It repeats the generated-block rule in one line, as 06
asked. Beyond the two things a hand edit never touches, it lists what is not a hand edit at
all: adding, renaming or moving a Note, sign-off, raw and source material, and CLI-written
files. It ends on `check` naming nothing in the edited Note. `check` passes with it in
place; it has no frontmatter, so it is not a Note.

**Closed 2026-10-03.** The author read `docs/house-style.md` and `wiki/CLAUDE.md` and let the five judgements stand. Both had already governed the Layer 0 drafts and reviews unchanged.
