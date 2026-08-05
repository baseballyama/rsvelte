---
"@rsvelte/compiler": patch
---

Pass a `null` prop alias to `$$ownership_validator.mutation(...)` for legacy `export let` props in dev mode, matching the official compiler — the alias is only ever set from a `$props()` destructuring key, so falling back to the variable name diverged for every legacy component.
