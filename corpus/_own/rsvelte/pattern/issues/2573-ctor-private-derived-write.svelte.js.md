# `2573-ctor-private-derived-write.svelte.js`

**Issue:** [#2573](https://github.com/baseballyama/rsvelte/issues/2573)

A private `$derived` field compound-assigned at a **constructor root**. On the client the pre-pass built its qualified lists from `$state` only, so the field fell through to a text scanner that classified the operator by the byte after `this.#d` and emitted `$.get(this.#d) >>>= 5`; on the server the same question is asked of `this.#d()` and produced `this.#d() >>>= 5`. Neither is JavaScript. `??=` pins the third row of the table — the operand must be `$.get(this.#d)`, never `.v` off a call result, and a `$derived` field never carries the `, true` proxy flag
