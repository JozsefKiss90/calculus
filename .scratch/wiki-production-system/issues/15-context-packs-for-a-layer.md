# 15: Context Packs for a Layer

**What to build:** The generated briefing that replaces exploration, and the agent that consumes it. Layer is computed as longest path to the Floor, never declared. `generate` emits one Pack per Node for a named Layer into a transient directory outside the vault, containing exactly: Node name and domain; the scaffolded skeleton; each prerequisite's one-sentence summary; each requiring Node's one-liner; the Archetype catalogue as names and one-liners; the house style rules; the notation authority; and the source Notes for the Node's domain. Nothing else.

The Pack must distinguish "no sources apply" from "no sources exist yet". Layer 0 is nine Floor Notes about signed arithmetic, fractions and plotting points, whose claims are elementary and need no citation, so an empty sources section there is the right answer rather than a gap being tolerated. An author who cannot tell the two apart will take the generous reading and write uncited.

The Note Author contract comes with it: one Pack, one Node, and it does not read the rest of the Wiki (ADR-0005).

**Blocked by:** 06, 07, 08, 13

**Status:** ready-for-agent

- [ ] Layer is computed; the Layer 0 run emits nine Packs, and the computed Layer count for Module 1 is 13
- [ ] A Pack contains exactly the specified contents and nothing more, with a test asserting on the absence of anything else
- [ ] Packs are written outside the vault, and no Pack is ever committed into `wiki/`
- [ ] A Pack's sources section says which of the two cases it means: no sources apply to this Node's claims, or no source Note exists yet for this domain
- [ ] A Pack carries the house style rules and the notation authority verbatim, not summarised
- [ ] The Note Author contract sets `status: drafted` and nothing else, never writes a reverse Edge or a generated block, and has a defined way to flag an Anchor Graph problem without changing it
- [ ] A Note drafted from a Pack alone passes `check`
