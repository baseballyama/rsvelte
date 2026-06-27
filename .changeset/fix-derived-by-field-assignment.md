---
"@rsvelte/compiler": patch
---

fix(transform): lower a write to a private state field inside a `$derived.by`

A `$derived.by(() => { … this.#x = v … })` class-field initializer ran a blind
read-replace that rewrote every `this.#x` to `$.get(this.#x)`, including
assignment targets, producing the invalid `$.get(this.#x) = v`. It now uses the
assignment-aware method transformer, which lowers the write to `$.set(...)`.
