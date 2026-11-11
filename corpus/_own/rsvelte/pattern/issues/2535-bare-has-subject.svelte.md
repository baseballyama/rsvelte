# `2535-bare-has-subject.svelte`

**Issue:** [#2535](https://github.com/baseballyama/rsvelte/issues/2535)

A subject-less `:has(.a)` is `*:has(.a)`: the argument must match inside **some element's subtree**, not merely exist in the component. The `:root` / `:global(...)` enclosing case is the opposite direction (upstream's `include_self`) and is covered by the `root` and `has` CSS fixtures
