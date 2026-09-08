# `2590-export-let-arrow-line-break.svelte`

**Issue:** [#2590](https://github.com/baseballyama/rsvelte/pull/2590)

A legacy `export let` default whose arrow **body starts on the next line** — the instance-script line accumulator must treat a trailing `=>` as a continuation, or the declaration closes early and emits `$.prop(..., (n) =>)`, which is not JavaScript. The `"a =>"` and following declaration pin the other side: a trailing `=>` **inside a string** must not swallow the next statement
