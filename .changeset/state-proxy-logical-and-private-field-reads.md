---
'@rsvelte/compiler': patch
---

fix(compiler): proxy `$state(a && b)` initializers and read private class-field state through `$.get`

Two silent reactivity bugs in the client output:

- a `$state` initializer whose top-level operator was `&&` was not wrapped in
  `$.proxy(...)`, so mutations to nested properties of the held value did not
  trigger updates (`||` and `??` were already handled).
- a `$state` private class field read inside a nested function in a constructor
  was rewritten to `this.#field.v.…` instead of `$.get(this.#field).…`, so the
  read was never registered as a dependency.
