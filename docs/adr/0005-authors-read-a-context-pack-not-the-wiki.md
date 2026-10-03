# Authors read a Context Pack, not the Wiki

Notes are written bottom-up by Layer — Layer 0's Floor Notes first, parallel within each Layer — and each authoring agent receives a script-generated Context Pack for exactly one Node. The agent does not read the rest of the Wiki. The Pack carries the Node's name and domain, the scaffolded skeleton, each prerequisite's one-sentence summary, each requiring Node's one-liner, the Archetype catalogue as names and one-line descriptions, the house style rules, the notation authority (`wiki/Conventions.md`), and the source Notes for its domain — or, where there are none, which of two cases that is: no sources apply to a Floor Node's claims, or no source Note exists yet for the domain. *(Notation authority and the two empty cases added by ticket 15.)*

## Considered Options

**Agent orients itself** — hand it the Node name and let it read the Wiki to find context.

**Hand-written ticket per Node** — 61 briefs under `.scratch/` for the first Module.

**Generated Context Pack** (chosen).

## Consequences

The Pack is small because the graph is thin: measured on the first Module's Anchor Graph, a Node has **at most 4 direct prerequisites, median 2**. A Pack is therefore one Node plus about two sentences of upstream context — which is what makes a strict "do not read the Wiki" rule affordable rather than punitive.

That rule is the point. An agent given a Node name and 61 Notes to explore spends most of its context deciding what to read, and every Note it reads is a surface for drift: it will absorb the voice, scope and claims of material that has nothing to do with its own Node. Bounding the input bounds the failure.

Bottom-up ordering is what makes the Pack sufficient. A Note's motivation and worked example should cite concepts that already exist in finished form, and only bottom-up guarantees they do. The usual objection — that you cannot write foundations before knowing what is built on them — does not apply here, because the frozen Anchor Graph (ADR-0001) already records every Node that will require this one, and the Pack includes them.

The cost is that an author cannot notice a problem outside its own Node. A contradiction between two Notes in the same Layer is invisible to both authors. That is deliberate: catching it is the Correctness Reviewer's job and the health script's job, both of which see the whole graph, and neither of which is writing prose.
