# 18: One Floor Note end to end

**What to build:** The acceptance test for the whole spec. One Layer 0 Note taken the full distance: scaffolded as a stub, a Pack generated for it, drafted by a Note Author from that Pack alone, given an Interactive by an Interactive Author reading the drafted Note, reviewed by a Correctness Reviewer from its bundle, and signed off by the author at `status: reviewed` and `reviewed_by: human`. `check` green throughout, with the dashboard and the log reflecting each transition.

This is the only ticket that answers the question the project turns on: does this pipeline produce a Note worth learning from? It sits behind the whole graph, which is why the hand-walk checkpoint after 04 exists — to surface a fundamental problem long before this ticket would.

**Blocked by:** 10, 12, 15, 16, 17

**Status:** ready-for-human

- [ ] One Floor Note reaches `status: reviewed` and `reviewed_by: human` through every stage, with no stage skipped and no hand-patching of a generated block
- [ ] `check` exits 0 at every stage, and the dashboard and log show each transition
- [ ] The Note is readable and complete in Obsidian alone, with the Interactive visible as a readable block
- [ ] The author judges the Note good enough to learn from — the one criterion no script checks
- [ ] Anything the Pack lacked for writing it is recorded against 15 rather than patched in place
- [ ] Human sign-off was the only route to reviewed, and no agent set either field
