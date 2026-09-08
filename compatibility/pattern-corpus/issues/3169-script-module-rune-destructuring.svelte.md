# `3169-script-module-rune-destructuring.svelte`

**Issue:** [#3169](https://github.com/baseballyama/rsvelte/issues/3169)

The same shapes reached through `<script module>` instead of `compileModule`. Two entry points, one pipeline — but the server strips its `$state*` calls at a different point on each, so a file that only exercised `compileModule` would not show whether the expansion still runs before that stripping in a component
