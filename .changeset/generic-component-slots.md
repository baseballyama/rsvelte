---
'@rsvelte/cli': patch
---

Type check a generic component's slot props as svelte-check does: `let:` on it reads the slots of the generics its props infer. A component that fills a named slot and has its own `on:` or `let:` now reads its parent's slot, not its own.
