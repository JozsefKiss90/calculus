# 14: Source Notes and the immutable raw store

**What to build:** One reference curated end to end, establishing the pattern for every later one. A named high-trust reference is extracted into `raw/` at the repo root, outside the vault, where it is immutable. One source Note per reference lands under `wiki/sources/` with `kind: source` plus `source_file`, `source_type` and `date_ingested`, validated by `check`, so Notes can cite a stable target rather than inventing one. Each notational convention the source uses is recorded in `wiki/Conventions.md` with attribution, so a conflict between two sources stays visible rather than being averaged away.

The Source Curator agent contract comes with it: its input is a named reference, and it never modifies raw material.

**Blocked by:** 05, 07

**Status:** ready-for-agent

- [ ] `raw/` holds the extract, and `check` fails if the content of a tracked raw file changes
- [ ] A source Note with a missing or invalid `source_file`, `source_type` or `date_ingested` fails `check`
- [ ] A source Note's `source_file` resolves to a file that exists in `raw/`
- [ ] Every notational convention the curated reference uses is recorded in `wiki/Conventions.md` with the source attributed
- [ ] Two sources disagreeing on one convention produce two attributed entries, never one merged entry
- [ ] The Source Curator contract states its input, forbids modifying raw material, and sets no `status` or `reviewed_by`
