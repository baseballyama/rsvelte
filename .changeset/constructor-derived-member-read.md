---
"@rsvelte/compiler": patch
---

Wrap a member-chain read of a `$derived` class field in a constructor. `this.#props.x` kept the raw private read where `$.get(this.#props).x` was required — the standalone-read pass skips a chain root by design and the constructor path, unlike the method path, never ran the member-chain pass.
