# a block comment whose erased host nested it deeper than the script

**Issue:** [#4515](https://github.com/baseballyama/rsvelte/issues/4515)
**Repro:** none — `crates/rsvelte_core/tests/erased_host_block_comment_indent_4515.rs`

A multi-line block comment re-emitted out of an erased TypeScript construct kept
the source's inner columns on its continuation lines; upstream re-indents them to
the enclosing level. The comment's opener now arrives at the column it had in the
source, so the downstream re-indent measures the distance the source really has.

No repro can live here. `ast_equiv_batch` runs with `CommentPolicy::Ignore`, so a
comment-only divergence is a pass on both arms, and the normalized byte
comparison runs both sides through oxfmt, which re-aligns a JSDoc body — measured
on this cell, raw `base == oracle` is false while normalized `base == oracle` is
true. A file placed here would pin nothing.
