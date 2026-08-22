---
"@rsvelte/compiler": patch
---

Stop reading a never-reassigned `export const x = $state(1)` through `$.get` in the component's `$$exports` object. Such a binding is not a state source — the declaration is already lowered to a plain `const x = 1` — so the official compiler emits a shorthand `{ x }` property outside dev mode, and a getter returning the bare identifier inside it.
