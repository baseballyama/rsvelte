---
"@rsvelte/cli": patch
---

`compileModule` no longer fails on a syntax error in the types of a `.svelte.ts` module, such as `declare class C { x = 1 }`. TypeScript's emit drops that code before Svelte reads it.
