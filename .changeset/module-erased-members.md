---
'@rsvelte/cli': patch
---

`compile` no longer prints a `.svelte.ts` module's `declare const` as `const g;`, and reads a class's overloads and `declare` fields the way svelte does.
