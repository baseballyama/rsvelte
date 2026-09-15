# a `$props()` declaration's comment printed off the declaration

**Issue:** [#4448](https://github.com/baseballyama/rsvelte/issues/4448)
**Repro:** none — `crates/rsvelte_core/tests/props_comment_trailing_4448.rs`

Upstream prints the comment after the `;` of the declaration the `$props()`
lowering produced. rsvelte printed it as its own statement ahead of the script
(the whole-object form, where the transform drops the comment) or on its own line
after the statement (the rest form, where it survives).

The axis is the comment's distance from the `$props(` call, not from the `let`:
`let p = /* c */\n$props()` floats the comment forward and
`let p =\n/* c */ $props()` trails the declaration. What decides is whether the
text between the comment and the call is blanks only — `let { a, /* c */ ...rest }`
is newline-free and stays in the pattern. All three directions are pinned in the
test.

No repro can live here, for the same reason as
`4453-comment-in-removed-props-pattern.md`: `ast_equiv_batch` runs with
`CommentPolicy::Ignore`, so a comment-only divergence is a pass on both arms.
