# 16: Correctness Reviewer bundle and the agent-reviewed gate

**What to build:** Review that is not self-review. A generated review bundle for one Note: the whole Note, its direct prerequisites' Notes so a reviewer can check it does not assume something untaught, and its Layer siblings so contradictions invisible to either author become visible. The Correctness Reviewer contract reads that bundle, checks mathematical correctness separately from the agent that wrote the prose, checks that claims trace to a source where required, and records findings a human can act on.

It may set `reviewed_by: agent`. It may not set `status: reviewed` or `reviewed_by: human` — human sign-off stays a distinct gate, and it is the only route to either.

**Blocked by:** 06, 14

**Status:** done

- [x] A bundle contains the Note, its direct prerequisites' Notes and its Layer siblings, and is generated rather than assembled by hand
- [x] Findings land somewhere a human reads, keyed to the Note they concern
- [x] Setting `reviewed_by: agent` leaves `status` unchanged
- [x] The contract forbids writing `status: reviewed` or `reviewed_by: human`, and names human sign-off as the only route to either
- [x] "Claims trace to a source where required" is stated precisely enough to apply, including the Floor case where elementary claims need no source
- [x] A fixture Note that assumes something none of its prerequisites teaches is caught

## Comments

From 16, which implemented it. `npm run generate -- --review "<Note name>"` rewrites the blocks as usual. It then writes one Review Bundle to `.review-bundles/<Note name>.md`, beside the vault. That directory is gitignored, and each run replaces only its own file, so Notes can be reviewed in parallel. The code is `scripts/lib/review-bundles.js`, and the contract is `.claude/agents/correctness-reviewer.md`. `tests/review-bundles.test.js` covers the Bundle through the CLI, with one Bundle compared byte for byte. `tests/correctness-reviewer.test.js` holds the real reviewer runs to the contract.

**A Bundle's shape.** It has six sections:
- **Note:** the Note under review, whole, with its domain and computed Layer.
- **Prerequisites:** each direct prerequisite's Note, whole.
- **Further below:** every deeper Node in the Prerequisite Closure, by name and summary.
- **Not taught before it:** every other Node of the Module, by name.
- **Layer siblings:** every other Note in the same Layer, whole.
- **Notation authority**, then **Sources:** these two follow the same rules as a Pack, including the two empty cases.

A prerequisite or sibling still at stub is named, not pasted, so its empty skeleton cannot be read as "teaches nothing relevant". A dependent's prose is never in a Bundle. A stub, an unknown name, or a missing `Conventions.md` exits 2 and writes no Bundle.

**Findings** go to `.scratch/correctness-reviews/<Note name>.md`, one file per Note, named exactly after it. Each review is appended as `## Review N`. The `Status` line follows the tracker's labels: `needs-triage` when a finding blocks, and `ready-for-human` when none does, because sign-off is next. The blocking kinds are `error`, `untaught`, `unsourced`, `contradiction` and `notation`. A `query` never blocks. The reviewer sets `reviewed_by: agent` only when nothing blocks. It changes no other byte of the Note: not `status`, and not `updated`, because a review is not a content edit. It never writes `status: reviewed` or `reviewed_by: human`.

**The real runs**, kept in `tests/fixtures/correctness-reviewer/`. Each was in a copy of the real vault, by a general-purpose agent given only the contract and one Bundle.
- **The caught fixture** is *Distributive law, expansion, and like terms*, written to use the index law, which only a Node outside its closure teaches. The index law was caught as `untaught`, naming *Index laws and fractional powers*. The reviewer also found a real `error` I had not planted: "like terms have the same letters" ignores powers. It found a `notation` slip and six `unsourced` claims, because there is no algebra source. The Note was left byte for byte as is.
- **The clean fixture** is *Factors and multiples*, a Floor Note I drafted for this. It was set `reviewed_by: agent`, with `status: drafted` unchanged, and the findings file is `ready-for-human` with two queries.
- **Ticket 15's drafted *Signed arithmetic and order of operations* was not passed.** "An even number of negative factors gives a positive answer" is false when a factor is 0. The `$1/2a$` aside uses letters before any Node teaches them. Ticket 18 should fix both before that Note enters the vault.

**Judgements for the author:**

- **A Floor Note may use the other Floor Nodes' ideas.** The first runs applied "Not taught before it" to the Floor as well. That failed *Factors and multiples* for using whole-number multiplication, and *Signed arithmetic* for using the number line. Both are the subjects of other Floor Nodes. I read the glossary's Floor Node as settling this: the Module assumes everything a Floor Node uses. So a Floor Note's Bundle leaves the other Floor Nodes out of that list. A Note above the Floor gets no such allowance: a Floor Node outside its closure is untaught for it. Change this if you meant Floor Notes to stand strictly alone.
- **The sourcing rule.** A claim needs a source when three things hold. The Note is not on the Floor. The claim is a definition, a rule or a convention. The Note teaches it rather than taking it from its closure. A calculation, a check, motivation or a counterexample never needs one. A claim traces to a source only when the source's `## What it covers` lists it. Until an algebra source exists, every algebra Note above the Floor collects `unsourced` findings, and none can reach `reviewed_by: agent`. That is the rule working, but it makes curating an algebra source a prerequisite for 18 above Layer 0.
- **Anchor Graph faults go in a finding, not a flag file.** The reviewer reports them in the findings file, for example *Distributive law…* using letters that only *Variables, substitution, and brackets*, a Node above it, teaches. I did not have it file to `.scratch/anchor-graph-flags/` as the Note Author does, so a human triages one file per Note.
- **`check` does not enforce the review fields' combinations.** For example, nothing stops `reviewed_by: agent` on a stub, or `reviewed_by: human` without `status: reviewed`. The contract forbids both, and the enums still hold. An invariant could enforce it if you want the gate, not the contract, to hold it.
- **`npm test` does not run on Node 20 here.** The `tests/**` glob needs Node 22, as `engines` says. I ran `node --test tests/*.test.js`. One unrelated failure was already there: `precommit-and-ci-gate` test 170 fails on CRLF line endings in the working copy of the CI workflow.

**Closed 2026-10-03.** Every criterion was met and ticket 18 ran the full Layer 0 pipeline on this implementation unchanged; the author signed off all nine Floor Notes and closed 18. The judgements recorded above stand as made unless the author reopens them.

**2026-10-03, reopened for one item and closed again.** The author took the fourth judgement the other way: `check` now holds the review fields' combinations as invariant 13, *status and reviewed_by agree*: a stub is reviewed by none, a drafted Note by none or agent, a reviewed Note by human. The Layer 0 sign-off had shown why: a hand edit left one Note at `drafted` with no reviewer, and only a re-read caught it. Tests are in `tests/check-notes.test.js`; the spec lists the invariant.
