---
'@rsvelte/cli': patch
---

`rsvelte typecheck` resolves an import of a component that svelte2tsx rejects even where it checks no other component of the project, as svelte-check does. Before, the import reported TS2307.
