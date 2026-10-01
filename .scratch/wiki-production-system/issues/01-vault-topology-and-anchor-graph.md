# 01: Vault topology and the frozen Anchor Graph

**What to build:** The vault exists, and the Anchor Graph lives inside it. `wiki/` becomes the Obsidian vault root: `.obsidian/` moves there from the repo root, the five domain directories exist and survive a clone, `wiki/observability/` and `wiki/sources/` exist, and `raw/` exists at the repo root outside the vault. `example_nodes.mmd` is promoted to `wiki/Module 1 Anchor Graph.md` — a move plus a frontmatter addition, not a rewrite. Opening Obsidian on `wiki/` shows the Anchor Graph Note with its 61 Nodes rendering as a diagram. No code in this ticket.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Obsidian opens with `wiki/` as the vault root, and `.obsidian/` is no longer at the repo root
- [x] The five domain directories — algebra, functions, limits, trigonometry, calculus — exist and survive a clone (git does not track empty directories, so each needs a `.gitkeep` until 04 populates it)
- [x] `wiki/observability/` and `wiki/sources/` exist
- [x] `raw/` exists at the repo root, outside the vault, recording that its contents are immutable
- [x] `wiki/Module 1 Anchor Graph.md` carries the graph verbatim from `example_nodes.mmd` in a mermaid block, has frontmatter valid under the schema, and renders in Obsidian
- [x] The Note states the Edge direction convention in prose: an arrow points at the prerequisite, so `A --> B` reads "A requires B"
- [x] `example_nodes.mmd` no longer exists at the repo root
- [x] The vault contains learning content only — no source code, no skills, no specs

## Comments

Four decisions were forced by this ticket that later tickets inherit. Each is a
judgement, not something the spec settled, so they are recorded here rather than
buried in a file.

**`domain: wiki` on the Anchor Graph Note.** Invariant 6 says every `domain` equals its
containing directory, and `domain` is required by the schema with no exception. The
Anchor Graph Note lives at the vault root, which is not a domain directory. Setting
`domain: calculus` would have broken invariant 6 on the one file most visible to a
reader. `domain: wiki` keeps the invariant mechanically true with no special case —
the validator in 05 can implement it as the basename of the file's parent directory
and nothing else. The same rule gives `observability` to the dashboard and `sources`
to source Notes for free.

**Nodes are `kind: concept`, not "any file with frontmatter".** The spec says
structural files are excluded from graph computation "by that absence" of frontmatter,
but the Anchor Graph Note and the source Notes both carry frontmatter and are not
Nodes. With `requires: []`, this Note would otherwise read as a tenth Floor Node,
failing invariant 4 and skewing the Floor-plausibility metric. The graph loader in 02
must select Nodes on `kind: concept`.

**`status: drafted` / `reviewed_by: none`, pending human sign-off.** The spec records
the graph as human-verified and frozen, so the honest values are `reviewed` and
`human` — but no agent may set either, so this agent did not. Flip both by hand. An
`## In one sentence` section is present, so the Note satisfies invariant 10 at
`drafted` either way.

**`.smart-env/` moved with the vault.** Not named in the ticket, but it is the
smart-connections plugin's embedding cache and the plugin anchors it to the vault
root, so leaving it behind would have orphaned it. It is still tracked, and it churns
on every Obsidian session; untracking it and adding it to `.gitignore` is worth
considering separately.

Verified by parsing the committed mermaid block rather than by reading it: 61 Nodes,
97 Edges, no duplicate Edges, acyclic, a single in-degree-zero root at *Derivative*,
61 of 61 reachable from it, 9 Floor Nodes. The block is byte-identical to
`example_nodes.mmd` apart from LF normalisation and a terminating newline.
