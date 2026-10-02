# 03: Pre-commit hook and CI gate

**What to build:** The gate runs automatically from the moment it exists. `check` is wired as a pre-commit hook and as a CI job, so a structural violation cannot land. Non-zero exit is the entire contract: the hook refuses the commit, CI fails the build. Wired now, against invariants 1 to 4 alone, so every invariant and metric added later inherits enforcement instead of waiting for it — which is what "a regression gate from the first commit" was supposed to mean.

**Blocked by:** 02

**Status:** done

- [x] A commit that introduces a structural violation is refused locally, with the report's human summary shown
- [x] CI runs `check` on every push and fails the build on non-zero exit
- [x] The hook is installed by a documented one-step setup, and a developer who has not installed it is still caught by CI
- [x] The hook adds no behaviour of its own: it runs the same subcommand a human runs, with no extra rules and no suppressions

## Comments

From 03, which wired the gate. Five decisions the ticket forced and the spec did not
settle, plus one trap worth knowing about.

**The hook is `core.hooksPath`, not Husky.** The one-step setup is
`git config core.hooksPath .githooks`, and the hook is a tracked file a reviewer can read.
02 decided no dependencies and no typechecker; a hook runner would have reversed that for
one shell line, and `lint-staged` in particular would have broken this ticket's fourth
checkbox by introducing a list of paths the gate cares about. `check` already reads the
whole vault, because an Edge added in one Note breaks an invariant computed across all of
them, so there is no staged subset to narrow to.

**The hook's body is `npm run check` and nothing else**, which is why the gate inherits
every invariant and metric 05 and 11 add without this file changing. A test asserts the
hook's non-comment lines are exactly that one command, and another asserts the hook's
output contains, verbatim, what `check` prints to a human — that pair is the fourth
checkbox made executable rather than promised. `npm run` over
`node scripts/wiki.js check wiki` deliberately: the vault path and subcommand are declared
once, in `package.json`, so the hook, CI and a terminal cannot drift. The two-line npm
banner is a feature in a hook — it names which command refused the commit.

**The hook judges the working tree, not the index.** `check` reads the vault as it is on
disk, so a partial commit (`git commit -- path`) is judged on the tree rather than on what
is being committed. Reading the index means stashing and restoring it, which is behaviour
of the hook's own and is what the fourth checkbox forbids; the honest cheap thing is to
judge the tree and say so in the hook's header. CI has no such gap: it checks out exactly
what landed.

**The hook is skippable and that is the point.** `git commit --no-verify` bypasses it, so
the hook is a fast local warning and CI is the authority. A test commits a violation in a
fixture repo with the hook *not* installed and asserts it lands, which is the third
checkbox's second half stated as a fact about the local gate rather than a hope — the
developer who never ran the setup step is caught by `.github/workflows/check.yml`, which
runs on every push to every branch.

**CI runs `npm test` after `npm run check`.** The ticket asked only for `check`; the suite
is the gate on the gate, 02 anticipated it ("03's CI needs no install step"), and a repo
whose CI does not run its own tests is a strange artefact. The gate runs first, so a
failing test can never hide a structural violation. No install step and no lockfile, which
is what keeps CI and a terminal the same thing.

**The trap: a CRLF hook is a gate that silently stops gating.** `core.autocrlf` is on for
at least one clone of this repo, so without `.gitattributes` an `autocrlf` checkout hands
every Unix machine and every CI runner a hook whose shebang reads `/bin/sh^M`, which
`/bin/sh` rejects. `.gitattributes` pins `.githooks/**` to `text eol=lf`, and the hook is
mode 100755 in the index — git silently skips a non-executable hook, so a working copy on
Windows, where the bit is synthetic, would otherwise commit a dead gate for everyone else.

That trap also produced the one test here worth copying. Asserting that the clone's hook
still refuses a commit does not discriminate: Git for Windows' own shell tolerates CRLF, so
the test passed with `.gitattributes` removed. The assertion that works on any platform is
on the cloned *bytes* — clone a fixture with `core.autocrlf=true`, read
`.githooks/pre-commit`, and fail on a carriage return. Verified both ways: with the file,
pass; without it, `the cloned hook has CRLF line endings and will not run`.

Two notes for the tickets that extend this. `tests/helpers/git-repo.js` is the fixture: a
throwaway git repo holding this repo's tooling, driven through real `git commit` calls, with
the Note's contents and the child-process helper imported from `tests/helpers/vault.js` so
there is one definition of each. Nothing here imports `scripts/lib/`.

The two tests that read `.githooks/pre-commit` and `.github/workflows/check.yml` as text are
deliberately outside the CLI seam, declared in the test file's header the way 02 declared
its real-vault exception. The wiring is configuration: it emits no file and returns no exit
code of its own, CI cannot be run from a test at all, and the thing most worth guarding is
that nobody quietly adds a suppression. The workflow is read by name, so a second workflow
added later cannot satisfy those assertions on this one's behalf.

