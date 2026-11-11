# a trailing script comment deferred past a generated call

**Issue:** [#4481](https://github.com/baseballyama/rsvelte/issues/4481)
**Repro:** none — `crates/rsvelte_core/tests/arrow_argument_comment_anchor_4481.rs`

A pending comment flushes at the first node **in print order** that carries a
position. `$.event('resize', $.window, () => c)` is synthesized, but its last
argument is the source arrow, which is where upstream flushes; rsvelte's arrows
carried no span, so the comment was deferred past the whole statement.

Two things decide it. The arrow needs the span (`JsArrowFunction::span`,
unconditional — the flush point may not depend on `enable_sourcemap`), and the
chunk's single anchor has to be claimed in print order: a statement prints before
anything inside it, so `JsStatement::Expression` claims before converting its
expression. Without the second half the arrow in `<X onclick={() => c} />` takes
the anchor the component call wants.

`{@html c}` stays divergent: its thunk is synthesized from `c`, not converted
from a source arrow, and upstream flushes into the thunk's own parameter list.
`{#key}` has since converged on its own.

No repro can live here, for the same reason as
`4529-component-call-comment-anchor.md`: `ast_equiv_batch` runs with
`CommentPolicy::Ignore`, so a comment-only divergence is a pass on both arms.
