# 10: Interactive Author and Archetype Builder agent contracts

**What to build:** Two agent contracts, both built on a catalogue that is now reviewed and a validator that now runs. The Interactive Author takes one drafted Note plus the Archetype parameter schemas and writes interactive blocks into it: it reads the Note first so the Interactive fits what was actually written, it writes a declarative specification rather than rendering code, and it reports that no Archetype fits rather than forcing a bad one. The Archetype Builder takes a named catalogue gap and produces one new Archetype's schema, which is how the closed set grows deliberately instead of becoming a cage.

Neither agent sets `status` or `reviewed_by`.

**Blocked by:** 08, 09

**Status:** ready-for-agent

- [ ] The Interactive Author's input contract is exactly one drafted Note plus the Archetype schemas; it does not read the rest of the Wiki
- [ ] Its output passes invariant 9 validation
- [ ] It has a defined way to report "no Archetype fits" that reaches a human, and it never silently picks the nearest one
- [ ] The Archetype Builder's input is a named gap and its output is one schema in the catalogue's existing shape
- [ ] Neither contract permits setting `status` or `reviewed_by`
- [ ] Running the Interactive Author against a Note drafted by hand produces a block that validates
