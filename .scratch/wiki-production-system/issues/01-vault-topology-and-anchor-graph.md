# 01: Vault topology and the frozen Anchor Graph

**What to build:** The vault exists, and the Anchor Graph lives inside it. `wiki/` becomes the Obsidian vault root: `.obsidian/` moves there from the repo root, the five domain directories exist and survive a clone, `wiki/observability/` and `wiki/sources/` exist, and `raw/` exists at the repo root outside the vault. `example_nodes.mmd` is promoted to `wiki/Module 1 Anchor Graph.md` — a move plus a frontmatter addition, not a rewrite. Opening Obsidian on `wiki/` shows the Anchor Graph Note with its 61 Nodes rendering as a diagram. No code in this ticket.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Obsidian opens with `wiki/` as the vault root, and `.obsidian/` is no longer at the repo root
- [ ] The five domain directories — algebra, functions, limits, trigonometry, calculus — exist and survive a clone (git does not track empty directories, so each needs a `.gitkeep` until 04 populates it)
- [ ] `wiki/observability/` and `wiki/sources/` exist
- [ ] `raw/` exists at the repo root, outside the vault, recording that its contents are immutable
- [ ] `wiki/Module 1 Anchor Graph.md` carries the graph verbatim from `example_nodes.mmd` in a mermaid block, has frontmatter valid under the schema, and renders in Obsidian
- [ ] The Note states the Edge direction convention in prose: an arrow points at the prerequisite, so `A --> B` reads "A requires B"
- [ ] `example_nodes.mmd` no longer exists at the repo root
- [ ] The vault contains learning content only — no source code, no skills, no specs
