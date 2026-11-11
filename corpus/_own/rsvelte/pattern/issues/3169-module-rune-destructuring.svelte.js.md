# `3169-module-rune-destructuring.svelte.js`

**Issue:** [#3169](https://github.com/baseballyama/rsvelte/issues/3169)

Every destructuring shape the module pipeline left unexpanded, in one `compileModule` unit: a default, a non-identifier key and a rest on `$state`; an array pattern on `$state.raw`; a computed `$derived` argument (which needs its own `$$d`) beside a bare-identifier one (which must **not** get one); and `$derived.by`. The second `$state` destructure is the control for name generation — one `tmp` per declarator, and the leaves must not collide
