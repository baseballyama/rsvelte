---
'@rsvelte/cli': patch
---

`rsvelte typecheck` drops a finding in the code it generates to declare `$store` and a component's snippets, as svelte-check does. A type-only store no longer gives an error at its import, and a store that refers to itself no longer refuses the component.
