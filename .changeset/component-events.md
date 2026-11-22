---
'@rsvelte/cli': patch
---

Type check a component's events as svelte-check does. Events from `createEventDispatcher` and from a bare `on:` keep their own types, and `strictEvents` limits a component to them.
