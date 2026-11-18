# `2535-explicit-nesting-non-ancestor.svelte`

**Issue:** [#2535](https://github.com/baseballyama/rsvelte/issues/2535)

`.a { & .b { … } }` where `.a` exists but is **not an ancestor** of `.b`. #2534 taught the implicit-`&` path to walk the real ancestor chain and deliberately bailed on an explicit `&`, which upstream resolves in place against `parent.prelude` instead of prepending
