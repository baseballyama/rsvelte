---
"@rsvelte/compiler": patch
---

Four client-output divergences from the official compiler:

- A numeric key in a `$props()` destructuring reaches `$.prop` as a number, not a string, and carries its value rather than its spelling (`0x10` → `16`). The same key is excluded from `$.rest_props` as a number, and a fractional key (`0.5`) is no longer truncated to `0` on the read-only path.
- A component prop whose value aliases a local function is passed through a getter (and through a thunk when spread), matching `scope.evaluate`, which never treats a function as a known value.
- A `const` initialised with a logical expression (`1 || 2`) or a regex literal folds into the template on all three targets; a folded regex is an object, so `{typeof c}` renders `object`.
- An optional `{@render sn?.()}` inside a snippet no longer blocks the module-scope hoist, so the closure is allocated once per module instead of once per component instance.
