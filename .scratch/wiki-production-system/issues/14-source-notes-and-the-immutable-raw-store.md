# 14: Source Notes and the immutable raw store

**What to build:** One reference curated end to end, establishing the pattern for every later one. A named high-trust reference is extracted into `raw/` at the repo root, outside the vault, where it is immutable. One source Note per reference lands under `wiki/sources/` with `kind: source` plus `source_file`, `source_type` and `date_ingested`, validated by `check`, so Notes can cite a stable target rather than inventing one. Each notational convention the source uses is recorded in `wiki/Conventions.md` with attribution, so a conflict between two sources stays visible rather than being averaged away.

The Source Curator agent contract comes with it: its input is a named reference, and it never modifies raw material.

**Blocked by:** 05, 07

**Status:** ready-for-human

- [x] `raw/` holds the extract, and `check` fails if the content of a tracked raw file changes
- [x] A source Note with a missing or invalid `source_file`, `source_type` or `date_ingested` fails `check`
- [x] A source Note's `source_file` resolves to a file that exists in `raw/`
- [x] Every notational convention the curated reference uses is recorded in `wiki/Conventions.md` with the source attributed
- [x] Two sources disagreeing on one convention produce two attributed entries, never one merged entry
- [x] The Source Curator contract states its input, forbids modifying raw material, and sets no `status` or `reviewed_by`

## Comments

From 14, which implemented it. The reference curated end to end is OpenStax *Calculus Volume 1*, section 2.2, "The Limit of a Function" (CC BY-NC-SA 4.0), chosen by the author. Its extract is `raw/openstax-calculus-volume-1/2-2-the-limit-of-a-function.html`, and its source Note is `wiki/sources/OpenStax Calculus Volume 1, section 2.2.md`. The Source Curator contract is `.claude/agents/source-curator.md`. Every criterion has a test in `tests/check-raw-store.test.js` (through the CLI) or `tests/conventions.test.js` (the real files).

**Immutability is a checksum manifest**, as the author chose. `raw/checksums.sha256` is in `sha256sum` format, so `cd raw && sha256sum -c checksums.sha256` verifies it without this tool. Invariant 12, `raw-store-unchanged`, fails in four cases: a tracked file's bytes differ (`raw-file-changed`); a tracked file is gone (`raw-file-missing`); a file has no checksum (`raw-file-untracked`); or a source Note's `source_file` names no file in `raw/` (`unresolved-source-file`). Untracked files fail, which is stricter than the ticket asked, because an untracked file is one nothing protects. `.gitattributes` marks `raw/**` as `-text`, so a CRLF clone keeps every byte. The manifest does not stop someone editing an extract and its checksum together. That edit is visible in a diff, and the contract forbids it. Invariant 12 is written back into the spec's list.

**Invariant 7 holds the three source keys.** Each is required on `kind: source` and absent elsewhere. `source_file` must be `raw/<path>`, with no `..` and no backslash. `date_ingested` must be a real date written YYYY-MM-DD. `source_type` is a closed enum (`textbook`, `lecture-notes`, `paper`, `reference-work`, `curriculum`). The spec does not name values, so the author should react to that list.

**Source Notes are written at `status: drafted`, `reviewed_by: none`**, the author's decision. The Curator never changes either afterwards.

**Conventions.md gained a third line type, Same,** for a source that writes something this Wiki's way. A source Note lists the entries its reference uses under `## Notation it uses`, and the conventions test holds both directions: each listed entry has a line attributed to that source, and each such line is listed. One line attributes one source. With only one source curated, "two sources disagreeing" is enforced by that rule, not yet shown by two real sources. The decimal entry shows the shape: "a comma between groups — UK and US everyday print" sits beside "a comma between groups — [[OpenStax…]]", and the two are never merged. The community attributions from 07 stay where OpenStax is not evidence for them. A US calculus textbook says nothing about UK schools or everyday print.

**For the author to rule on:**

- **New entries and their This Wiki lines.** The new entries are Function notation, Piecewise definitions, Limit, One-sided limits, and A limit that does not exist. Their **This Wiki** lines are proposals.
- **The 120-line budget is now 140.** Conventions.md is 122 lines, and every curated source adds lines. The budget will need a decision again, or Packs will need a slice of the file rather than all of it.
- **Testing-standard deviation.** `tests/conventions.test.js` now reads `wiki/sources/` as well as `Conventions.md`. That stretches 07's ruled deviation. The alternative is to move the attribution rules into `check`.

**For 15:** a source Note's `domain` is `sources` (invariant 6), so "the source Notes for the Node's domain" cannot come from `domain`. This one carries `tags: [limits]`, and the contract tells the Curator to tag each domain a reference serves. A Pack can select on that tag.
