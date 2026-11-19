---
'@rsvelte/cli': patch
---

`rsvelte typecheck` types the `load` functions, endpoints, actions, hooks and params matchers of SvelteKit files as svelte-check does, so their untyped parameters are no longer implicitly `any`.
