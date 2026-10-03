# 04: Scaffold the 61 stub Notes

**What to build:** One command turns the empty vault into all 61 Notes, so every prerequisite link resolves before any content exists. `scaffold` reads the Anchor Graph and, for each Node, creates the Note that carries it under its domain directory with `kind: concept`, `domain` equal to that directory, `requires` as wikilinks to its direct prerequisites, `status: stub`, `reviewed_by: none`, `created` and `updated`, and the eight-section skeleton. Filenames are Title Case with spaces and no numeric prefixes; where a concept name contains a character illegal in a filename, the filename spells it out and the mathematical form goes in `aliases`. Idempotent, and it never overwrites existing content.

**Blocked by:** 02

**Status:** done

- [x] One run creates 61 Notes across the five domains, and Obsidian's graph view shows no unresolved links
- [x] Every created Note has the eight sections in spec order, with the two generated sections present but empty between their markers
- [x] A second run writes nothing and reports no change
- [x] A run after a Note has been hand-edited leaves that Note's content byte-identical
- [x] Scaffolding a Node absent from the Anchor Graph is refused, with a message naming the Node
- [x] Notes whose concept name needs spelling out carry the mathematical form in `aliases`
- [x] 9 of the 61 Notes have an empty `requires`, matching the Anchor Graph's Floor

## Comments

From 04, which scaffolded the vault. `npm run scaffold` created 61 Notes: algebra 17,
functions 13, limits 13, trigonometry 17, calculus 1. Nine have `requires: []`, and a
second run reports `no change: all 61 Notes already exist`. The first checkbox stays open
for one reason: a test proves every `requires` wikilink names an existing Note, but only a
human can open Obsidian and confirm the graph view shows no unresolved links.

Seven decisions the ticket forced and the spec did not settle:

**Filenames keep the Node's own casing, not literal Title Case.** The spec says "Title
Case with spaces", but its own example, *Limit of sin h over h as h approaches zero*, is in
sentence case. Title-casing mathematics gives "Sin H Over H", which is wrong. The filename
is the Node's name exactly as the Anchor Graph writes it, and "Title Case" is read as
"human words with spaces, not a slug".

**Only `/` is spelled out, as "over".** It is the only illegal character in the graph,
and "over" reads the way the mathematics does. Any other character a filename or wikilink
cannot hold (`\ : * ? " < > | # ^ [ ]`) is refused, naming the Node and the character,
rather than given a spelling nobody chose. A name that needed spelling out keeps its
mathematical form in `aliases`. `requires` links to the filename, so the link resolves.

**A Node's domain is the subgraph it is named in, else the first subgraph it appears
in.** The second clause exists for the domains' head Nodes (*Algebra*, *Limits*, …). They
are named on the Terminal Node's line, outside every subgraph, and used only inside their
own. Subgraph ids map to directories through `DOMAINS` in `scripts/wiki.js`, beside
`TERMINAL_NODE`, because neither the id (`ALG`) nor the label ("Functions, slopes, and
rates") is a directory name. The Terminal Node sits outside every subgraph and goes to
`calculus`. A subgraph missing from the table, or any other Node outside every subgraph, is
refused rather than guessed at. The Anchor Graph loader now records membership; no
invariant reads it.

**Scaffold refuses a graph that fails invariants 1 to 4.** Writing structure that `check`
would reject puts unreviewed structure into the vault.

**Existing Notes are matched by case-folded filename anywhere at depth 1, never
duplicated.** A Note a human moved to the wrong directory is left there, and the run says
so. A second copy would give one Node two Notes and make the wikilink ambiguous. Invariant
6 in 05 is what flags the move. Matching is case-folded because review caught a crash:
`algebra/factorisation.md` made by hand is the same file as `Factorisation.md` on Windows,
so the `wx` write threw EEXIST partway through a run. The flip side is that a same-named
file in `sources/` would stop a concept Note being created. That is accepted, because
Obsidian needs unique basenames anyway.

**Refusals exit 2 and write nothing.** Every Note is planned before any is written.

**Generated-block markers** are `<!-- generated:start builds-on -->` and
`<!-- generated:end builds-on -->`, and the same pair for `required-by`. They are HTML
comments, so they are invisible in Obsidian's reading view.

Notes for the tickets that extend this:

- **05: two Notes are not named after their Node.** *Limit of sin h / h as h approaches
  zero* and *Limit of (cos h - 1) / h as h approaches zero* live in files spelled with
  "over". 02's plan for the Notes' front-end ("Note name as the Node name") would make
  invariant 11 fail on a freshly scaffolded vault. Map each Note back to its Node through
  its `aliases`, or apply the same spelling to Anchor Graph names before comparing.
- **06: there is no marker for the mini-map yet.** The spec's third generated block was
  not in this ticket's skeleton. 06 must decide where its marker pair goes and insert it
  into Notes that may already hold prose. Inserting after the `builds-on` end marker
  avoids touching authored text.
- **Node 22 is assumed.** This machine runs Node 20.11, where `npm test`'s glob does not
  expand. Run `node --test tests/*.test.js` instead. On this clone,
  `CI runs the same npm scripts…` fails before and after this change, because
  `core.autocrlf` checks `check.yml` out with CRLF and its `/^on:\n/` regex expects LF.
  This is a test-or-attributes fix that belongs to 03's area, not to this ticket.

**Closed 2026-10-03.** The author opened the vault in Obsidian and confirmed the graph view shows no unresolved links.
