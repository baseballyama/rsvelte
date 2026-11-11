# `reactive-effect-comment-hole.svelte`

**Issue:** corpus residue

`LabeledStatement.js` returns `b.empty` and the `$.legacy_pre_effect` calls are appended after the whole instance body, so a `$:` is a HOLE in the first printing pass — `body()` skips the `EmptyStatement` and nothing inside the statement moves the comment cursor while its neighbours print. `dead_comments` walked the subtree like any other, so the block inside the first `$:` kept alive a comment the second `$:`'s own thunk kills. Two `$:` are the discriminating shape: with only one, its block leaves the cursor alive and the comment reaches the template instead, which is why the fix simulates the effects rather than treating a `$:` as a kill.
