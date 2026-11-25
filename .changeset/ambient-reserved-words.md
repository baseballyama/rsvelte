---
'@rsvelte/cli': patch
---

In a component's TypeScript script, `compile` refuses a reserved word as a name in an ambient context, such as `declare let static: number`, as Svelte does. It also refuses a class named by a TypeScript keyword, such as `class type {}`. A class field's value in an ambient context, or on an abstract field, is now reported at its `=`. The error for an abstract field names its key as Svelte does. A bundler erases the types of a `.svelte.ts` module before Svelte reads it, so these rules no longer apply there, and neither do the rules for `override` and `export declare global`.
