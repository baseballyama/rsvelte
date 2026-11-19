---
'@rsvelte/cli': patch
---

`rsvelte typecheck` types the `load` functions and endpoints of SvelteKit files as svelte-check does, so their untyped parameters are no longer implicitly `any`. It also types form actions and the hooks files.
