# `3164-on-directive-inner-init.svelte`

**Issue:** [#3164](https://github.com/baseballyama/rsvelte/issues/3164)

The `$.derived` an `on:` directive declares was emitted beside the `$.element(...)` callback instead of inside it, so it was created once per component rather than once per element instantiation. All three handler shapes that declare something are here — a call, a `.bind`, a sequence — because the loop drains init once and a single shape cannot show it drains all of it; a plain arrow or identifier handler declares nothing and is therefore not a case
