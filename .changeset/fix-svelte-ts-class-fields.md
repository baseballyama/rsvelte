---
"@rsvelte/compiler": patch
---

fix(transform): three `.svelte.(js|ts)` class-field SSR fixes

- Private `$derived` reads inside arrow-function class fields (`onkeydown = (e) =>
  { … this.#derived … }`) are now called (`this.#derived()`), matching the
  Field/Method handling.
- A multi-line `$state(...)` / `$state.raw({ … })` field initializer is now
  unwrapped to its inner value (a plain public server field) instead of leaking
  the rune and being privatized.
- A class member whose arrow body is nested in a call
  (`onpointermove = whenMouse(() => { … })`) no longer runs away the member
  accumulator and drops every following member.
