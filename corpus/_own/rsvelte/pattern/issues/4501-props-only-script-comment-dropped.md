# value-position comment dropped when `$props()` is the script's only statement

**Issue:** [#4501](https://github.com/baseballyama/rsvelte/issues/4501)
**Repro:** none — `crates/rsvelte_core/src/compiler/phases/3_transform/client/tests.rs`

A block comment in the value position of a destructured `$props()` declaration
was dropped from the client output when that declaration was the script's only
statement. The transform removes the declaration, the instance script becomes
empty, and the loop that re-emits a dropped declaration comment is inside
`if !trimmed.is_empty()`. Re-entering the comments as the script's text puts
them in the comment buffer, so the template root's declarator — which already
carries the source anchor upstream stamps on it — picks them up.

No repro can live here, for the same reason as
`4453-comment-in-removed-props-pattern.md`: a comment-only divergence is
AST-equivalent, so the corpus scores it a pass on both arms. The corpus also has
no instance of the shape at all — the issue's screen over 35,723 files finds 0 —
so a repro added here would be guarded by nothing.
