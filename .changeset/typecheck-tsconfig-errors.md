---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reports the errors of the project's `tsconfig.json`, such as an `include` that matches no file, an empty `files` or an unknown compiler option, and exits 1, as svelte-check does.
