---
'@rsvelte/cli': patch
---

`rsvelte typecheck` on Windows names a file as TypeScript does, with forward slashes. That fixes two problems: a component's precomputed projection was not found, and its TS7016 message did not match svelte-check's.
