# `3138-title-known-value-folding.svelte`

**Issue:** [#3138](https://github.com/baseballyama/rsvelte/issues/3138)

`<title>{zero}</title>` compiled to `zero ?? ''` where official writes `'0'`: upstream's single-value chunk stringifies every known with `+ ''`, and rsvelte inlined string-valued knowns only. A numeric known is the case the carve-out named as the reason for excluding itself, so it is the one the file carries; the string kinds already matched
