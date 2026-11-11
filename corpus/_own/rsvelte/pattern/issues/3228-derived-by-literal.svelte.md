# `3228-derived-by-literal.svelte`

**Issue:** [#3228](https://github.com/baseballyama/rsvelte/issues/3228)

`$derived.by(() => 1)` read through `typeof`, the arm where upstream evaluates the arrow's expression body. The `typeof` is incidental — it is what #3213 item 2 was reported against, and this row is the proof the read shape is not the discriminator
