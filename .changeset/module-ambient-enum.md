---
'@rsvelte/cli': patch
---

`compile` now drops an ambient `enum` declaration, such as `declare enum E { A }`, from a `.svelte.ts` module before it analyzes the module, as TypeScript's emit does. A name the module declares again beside it no longer fails as declared twice.
