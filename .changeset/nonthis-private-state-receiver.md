---
"@rsvelte/compiler": patch
---

Compile a private `$state` field the same way through any receiver, not just `this`

A class constructor that reaches a private field through an alias
(`const inst = this; inst.#n …`) took a different code path from `this.#n`, and
that path modelled less than upstream does. Upstream keys the private-field
branch off `PrivateIdentifier`, never off the receiver, so all three of these
were wrong:

- **Invalid output.** Logical (`??=`, `&&=`, `||=`) and bitwise/shift compounds
  were in neither allowlist, so the assignment was never rewritten and the
  read-wrapping pass turned the *left-hand side* into a call —
  `$.get(inst.#n) ??= s`, which is not parseable JavaScript and which
  Vite/Rolldown reject outright.
- **Silently lost proxying.** `inst.#n = { a: 1 }` on a `$state` field dropped
  the `, true` proxy flag. This output parsed and ran; it just was not reactive
  in the way the source asked for.
- **Wrong read form.** Reads and compound operands used `$.get(inst.#n)` where
  upstream reads `inst.#n.v` while `in_constructor`.

Reads through an alias now follow the same rule as `this`: `.v` for `$state` /
`$state.raw` at constructor depth, `$.get` inside a nested function, in a method
body, or for a `$derived` field.
