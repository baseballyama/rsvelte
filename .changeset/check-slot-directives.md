---
'@rsvelte/cli': patch
---

`rsvelte check` no longer skips a component that has a `use:`, transition or `animate:` directive on a `<slot>`. The compiler rejects those directives, and `rsvelte check` now types their expressions as svelte2tsx does, with the slot as the element.
