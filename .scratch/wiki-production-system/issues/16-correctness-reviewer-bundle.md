# 16: Correctness Reviewer bundle and the agent-reviewed gate

**What to build:** Review that is not self-review. A generated review bundle for one Note: the whole Note, its direct prerequisites' Notes so a reviewer can check it does not assume something untaught, and its Layer siblings so contradictions invisible to either author become visible. The Correctness Reviewer contract reads that bundle, checks mathematical correctness separately from the agent that wrote the prose, checks that claims trace to a source where required, and records findings a human can act on.

It may set `reviewed_by: agent`. It may not set `status: reviewed` or `reviewed_by: human` — human sign-off stays a distinct gate, and it is the only route to either.

**Blocked by:** 06, 14

**Status:** ready-for-agent

- [ ] A bundle contains the Note, its direct prerequisites' Notes and its Layer siblings, and is generated rather than assembled by hand
- [ ] Findings land somewhere a human reads, keyed to the Note they concern
- [ ] Setting `reviewed_by: agent` leaves `status` unchanged
- [ ] The contract forbids writing `status: reviewed` or `reviewed_by: human`, and names human sign-off as the only route to either
- [ ] "Claims trace to a source where required" is stated precisely enough to apply, including the Floor case where elementary claims need no source
- [ ] A fixture Note that assumes something none of its prerequisites teaches is caught
