---
'@rsvelte/cli': patch
---

`compile` now reports a character ECMAScript does not allow inside the module reference of an `import type` alias, such as U+0085, before the alias error, as Svelte does.
