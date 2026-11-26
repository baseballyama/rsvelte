---
'@rsvelte/cli': patch
---

`ts.compile` erases a `declare enum` as TypeScript's emit does, instead of refusing it, and a `.svelte.ts` module keeps a namespace that holds one.
