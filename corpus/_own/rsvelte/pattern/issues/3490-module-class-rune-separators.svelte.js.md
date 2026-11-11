# `3490-module-class-rune-separators.svelte.js`

**Issue:** [#3490](https://github.com/baseballyama/rsvelte/issues/3490)

The `compileModule` server class-field pass recognizes `$derived`, `$state`, and `$state.raw` after repeated spaces, tabs, line breaks, block comments, NBSP, and U+FEFF instead of leaking the client setter shape into SSR output.
