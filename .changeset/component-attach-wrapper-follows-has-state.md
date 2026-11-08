---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Stop wrapping a component `{@attach}` expression in `($$node) => (expr || $.noop)($$node)` when it reads no state, for example `{@attach (el) => el.focus()}`, and drop `|| $.noop` when the expression is known to be a function, as upstream does.
