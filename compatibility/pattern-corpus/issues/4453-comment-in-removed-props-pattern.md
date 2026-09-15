# comment in a removed `$props()` destructuring pattern

**Issue:** [#4453](https://github.com/baseballyama/rsvelte/issues/4453)
**Repro:** none — `crates/rsvelte_core/tests/props_pattern_comment_4453.rs`

A comment inside a destructured `$props()` pattern was dropped, or overtook an
earlier comment, when the client transform removed the declaration the comment
sat in. Fixed by #4447.

No repro can live here. The divergence is comment-only, so it is byte-different,
AST-equivalent, and scored a **pass** by every corpus entry and every target —
`verify.mjs` calls `ast_equiv_batch` with no arguments, which means
`CommentPolicy::Ignore`. A file placed here would therefore be green on both
arms, which convention 6 forbids: it would pin nothing and could not regress.
