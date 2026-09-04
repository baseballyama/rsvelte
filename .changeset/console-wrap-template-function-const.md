---
"@rsvelte/compiler": patch
---

A `const` or `let` declared inside a template expression's function body now
produces one binding record instead of two, so the reference and the
initializer metadata that resolves it live on the same record. `scope.evaluate`
no longer falls back to an unknown value for such a name, and a dev-mode
`console.log` whose arguments are all locally declared is left unwrapped, as the
official compiler leaves it.
