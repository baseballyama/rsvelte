---
"@rsvelte/compiler": patch
---

Fix the `$.set` emitted for a `#private` `$state` field inside a class constructor

Two divergences from the official compiler, both visible in `.svelte.js` / `.svelte.ts`
class output:

- A logical assignment (`??=`, `||=`, `&&=`) always appended the `, true` proxy flag.
  Upstream `AssignmentExpression.js` gates it on `field.type === '$state'`, so a
  `$state.raw` or `$derived` field must not carry it — `this.#x ??= { … }` on a
  `$state.raw` field now emits a two-argument `$.set`.
- A compound assignment read the operand as `$.get(this.#n)`. Upstream
  `MemberExpression.js` reads a `$state` / `$state.raw` field as `this.#n.v` while
  `in_constructor`, so `this.#n += 1` now emits `$.set(this.#n, this.#n.v + 1)`.
  Reads inside ordinary methods keep going through `$.get`, and a `$derived` field
  keeps going through `$.get` everywhere.
