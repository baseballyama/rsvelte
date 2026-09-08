# `3216-state-destructure-default-split.svelte`

**Issue:** [#3216](https://github.com/baseballyama/rsvelte/issues/3216)

The synthesized `let tmp = …, a = $.proxy($.fallback(tmp.a, 1))` measures 51 columns and so breaks one declarator per line. The one byte that takes it over is the space between the `$.fallback` arguments, which this port materialises as a retro-patchable layout span and therefore did not count
