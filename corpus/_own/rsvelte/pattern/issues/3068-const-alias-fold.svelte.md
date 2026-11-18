# `3068-const-alias-fold.svelte`

**Issue:** [#3068](https://github.com/baseballyama/rsvelte/issues/3068)

`scope.evaluate` follows a binding whose initializer is another identifier, so `const K = 1; let v = $state(K)` folds `{v}` to static text upstream. rsvelte only recursed into an initializer it had already reduced to a literal string, and the rune-argument site never stored the init AST at all, so one level of aliasing kept the chunk reactive — and changed the template text (`<p> </p>` vs `<p></p>`)
