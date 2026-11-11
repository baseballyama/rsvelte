# instance-script comment dropped before a component call with children

**Issue:** [#4517](https://github.com/baseballyama/rsvelte/issues/4517)
**Repro:** none — `crates/rsvelte_core/tests/instance_script_dropped_comment_4517.rs`

A comment at the end of the instance script was dropped when the first template
statement was a component call with children: under split coordinates a real
source offset sits *below* `loc_base`, so `Printer::has_loc` read it as "no
location", the located flush declined it, and a comment with no comment-space
node after it was never emitted. `print_split` now prints once and prints again
only when the first pass dropped something.

No repro can live here, for the same reason as
`4453-comment-in-removed-props-pattern.md`: a comment-only divergence is
AST-equivalent, so the corpus scores it a pass on both arms. The guard's own
discriminating shape — comments the first pass already places, which a broader
rule would *move* — is likewise invisible to the corpus and lives in the test.
