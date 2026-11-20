---
'@rsvelte/cli': patch
---

`svelte/no-useless-mustaches` now fixes a string literal that starts or ends with U+0085, as ESLint does.
Numeric `svelte.config.js` keys such as `1e21` or `1e-7` now get the names JavaScript gives them.
