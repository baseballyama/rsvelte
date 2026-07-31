---
"@rsvelte/compiler": patch
---

fix(compiler): lower the `$inspect` rune in dev when it is the only rune in a component, and in `.svelte.js` module scripts — both previously emitted `$inspect(...)` verbatim, which throws `ReferenceError` at runtime
