---
'@rsvelte/cli': patch
---

`typecheck` now prints a path inside the project as an absolute path in TypeScript's messages, such as TS7016's, as svelte-check does. It printed that path from the project's root before.
