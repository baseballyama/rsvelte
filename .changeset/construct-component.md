---
'@rsvelte/cli': patch
---

`rsvelte typecheck` constructs a component the way svelte2tsx does. A component whose props are a union now reports a missing prop with TS2322, as svelte-check does. A `null` component, or a function that returns no object, now reports TS2351 `This expression is not constructable.` at svelte-check's position. A function component that is generic takes its constraints, as in svelte-check.
