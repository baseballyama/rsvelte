---
'@rsvelte/cli': patch
---

`svelte/no-useless-mustaches` now fixes a string literal that starts or ends with U+0085, as ESLint does, and `svelte.config.js` keys written as numbers such as `1e21` or `1e-7` are read under the name JavaScript gives them.
