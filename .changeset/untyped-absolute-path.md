---
'@rsvelte/cli': patch
---

`typecheck` now prints TS7016's path to an untyped component inside the project as an absolute path, as svelte-check does. It printed that path from the project's root before.
