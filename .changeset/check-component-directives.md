---
'@rsvelte/cli': patch
---

`rsvelte check` no longer skips a component that has a `use:`, transition, `animate:` or `style:` directive on a child component. The compiler rejects those directives, and `rsvelte check` now types their expressions as svelte2tsx does, with any value standing for the node.
