# 03: Pre-commit hook and CI gate

**What to build:** The gate runs automatically from the moment it exists. `check` is wired as a pre-commit hook and as a CI job, so a structural violation cannot land. Non-zero exit is the entire contract: the hook refuses the commit, CI fails the build. Wired now, against invariants 1 to 4 alone, so every invariant and metric added later inherits enforcement instead of waiting for it — which is what "a regression gate from the first commit" was supposed to mean.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] A commit that introduces a structural violation is refused locally, with the report's human summary shown
- [ ] CI runs `check` on every push and fails the build on non-zero exit
- [ ] The hook is installed by a documented one-step setup, and a developer who has not installed it is still caught by CI
- [ ] The hook adds no behaviour of its own: it runs the same subcommand a human runs, with no extra rules and no suppressions
