---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reports the errors of the project's `tsconfig.json` and exits 1, as svelte-check does. Examples are an `include` that matches no file, an empty `files` and an unknown compiler option.
