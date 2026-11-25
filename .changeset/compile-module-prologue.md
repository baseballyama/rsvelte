---
'@rsvelte/cli': patch
---

A `.svelte.js` or `.svelte.ts` module keeps its leading directives, such as `"use strict"`, after
the runtime import, as `compileModule` does.
