# 04: Scaffold the 61 stub Notes

**What to build:** One command turns the empty vault into all 61 Notes, so every prerequisite link resolves before any content exists. `scaffold` reads the Anchor Graph and, for each Node, creates the Note that carries it under its domain directory with `kind: concept`, `domain` equal to that directory, `requires` as wikilinks to its direct prerequisites, `status: stub`, `reviewed_by: none`, `created` and `updated`, and the eight-section skeleton. Filenames are Title Case with spaces and no numeric prefixes; where a concept name contains a character illegal in a filename, the filename spells it out and the mathematical form goes in `aliases`. Idempotent, and it never overwrites existing content.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] One run creates 61 Notes across the five domains, and Obsidian's graph view shows no unresolved links
- [ ] Every created Note has the eight sections in spec order, with the two generated sections present but empty between their markers
- [ ] A second run writes nothing and reports no change
- [ ] A run after a Note has been hand-edited leaves that Note's content byte-identical
- [ ] Scaffolding a Node absent from the Anchor Graph is refused, with a message naming the Node
- [ ] Notes whose concept name needs spelling out carry the mathematical form in `aliases`
- [ ] 9 of the 61 Notes have an empty `requires`, matching the Anchor Graph's Floor
