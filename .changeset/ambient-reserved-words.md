---
'@rsvelte/cli': patch
---

In a component's TypeScript script, `compile` refuses a reserved word as a name in an ambient context, such as `declare let static: number`, as Svelte does. A class field's value in an ambient context, or on an abstract field, is now reported at its `=`. The error for an abstract field names its key as Svelte does.
