---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

`createEventDispatcher` event names and typings now match official svelte2tsx. The dispatcher factory is recognised through the local name the `svelte` import binds it to, so `import { createEventDispatcher as foo }` works (and a same-named local that was never imported no longer counts); every typed `createEventDispatcher<T>()` in a component contributes its own `...__sveltets_2_toEventTypings<T>()` spread instead of only the last one, with a name declared by two of them degrading to `CustomEvent<any>` and gaining a `customEvent` entry; and `dispatch(name)` resolves `name` through a string constant declared earlier in the instance script. Dispatchers declared inside a function are tracked too, and the `events.getAll()` API surface now includes the events a typed dispatcher declares.
