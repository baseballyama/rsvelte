---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

`parse()` now returns `TSParameterProperty` with its `accessibility`, `readonly` and `parameter`,
and a class `Decorator` with its `loc` and `expression`. Both nodes were emitted as bare
`{type, start, end}` objects.
