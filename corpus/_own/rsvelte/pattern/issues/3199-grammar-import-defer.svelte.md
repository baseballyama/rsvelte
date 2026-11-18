# `3199-grammar-import-defer.svelte`

**Issue:** [#3199](https://github.com/baseballyama/rsvelte/issues/3199)

`import defer * as ns from` — a stage-3 import phase. acorn stops at the FIRST SPECIFIER rather than at the phase keyword, which is why the position comes from the specifier span
