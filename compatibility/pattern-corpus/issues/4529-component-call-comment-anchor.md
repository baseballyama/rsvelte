# a trailing script comment printed after the whole function body

**Issue:** [#4529](https://github.com/baseballyama/rsvelte/issues/4529)
**Repro:** none — `crates/rsvelte_core/tests/component_call_comment_anchor_4529.rs`

esrap flushes a pending comment at the first generated statement whose source
position is at or after it. The client component call carried no such position,
so with a comment at the end of the instance script the flush fell through to the
end of the function body — past every statement the template lowered to, which a
one-component cell cannot distinguish from "after the call". Upstream anchors the
call on the tag's own `start`.

The dev target is a different writer and still diverges: `add_svelte_meta` wraps
the call in an arrow, and upstream flushes the comment *inside* the arrow
(`() => // c` then the call), which a statement-level anchor cannot express.

No repro can live here, for the same reason as
`4448-props-declaration-comment.md`: `ast_equiv_batch` runs with
`CommentPolicy::Ignore`, so a comment-only divergence is a pass on both arms.
