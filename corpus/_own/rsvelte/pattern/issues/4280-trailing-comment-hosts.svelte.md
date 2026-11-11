# `4280-trailing-comment-hosts.svelte`

**Issue:** [#4278](https://github.com/baseballyama/rsvelte/issues/4278), [#4280](https://github.com/baseballyama/rsvelte/issues/4280)

A trailing comment on a legacy prop declaration, on the **client**. The comment was located by scanning the declaration's last source line for `//`, which finds neither a block comment nor a comment on a wrapped line; and `transform_let_with_reexported_props` — the port a `let d = {}; export { d }` reaches — had no trailing-comment handling at all, so the second host was a second defect rather than a second cell. Where the comment goes depends on whether the call the declaration lowers to holds a node esrap can attach to: `a` and `b` have no default and none, `c` has a synthesized thunk, `d` and `e` reach the other port. A line comment inserted before a `)` must carry its own newline or it swallows the rest of the call, which is why the two spellings are crossed with the hosts rather than assumed equivalent.
