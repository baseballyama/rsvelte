# `3138-title-known-nullish.svelte`

**Issue:** [#3138](https://github.com/baseballyama/rsvelte/issues/3138)

The other side of the same fold: a known-**nullish** title becomes `''`, not a `?? ''` around a name whose value is already decided. It needs its own file because one `<svelte:head>` admits one `<title>`, and the single-expression path is the one that was wrong
