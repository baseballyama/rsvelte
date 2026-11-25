---
'@rsvelte/cli': patch
---

A directive with an escape, such as `"it\'s"`, keeps its value in a compiled module and in a
component's module script. A `.svelte.ts` script that spells `"use strict"` with an escape no
longer gets a second one, as in TypeScript's emit.
