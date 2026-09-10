# a one-line erased annotation's comment printed on its own line

**Issue:** [#4397](https://github.com/baseballyama/rsvelte/issues/4397)
**Repro:** none — `crates/rsvelte_core/tests/erased_annotation_comment_line_4397.rs`

The flush that puts an erased annotation's comment back at the initializer wrote
a newline after it unconditionally. Upstream keeps it inline when the comment
shared the initializer's source line.

The axis is the text between the comment's end and the flush point: a newline
*before* the comment (`let a: {`⏎`/* c */ b: number } = { b: 1 };`) still prints
inline, and a multi-line initializer still prints inline. Only a newline between
the two breaks the line.

No repro can live here, for the same reason as
`4453-comment-in-removed-props-pattern.md`: `ast_equiv_batch` runs with
`CommentPolicy::Ignore`, so a comment-only divergence is a pass on both arms.
#4397 also records a source-shape screen over 33,890 corpus `.svelte` files that
selects 0 carriers, so no corpus growth is the instrument for this either.
