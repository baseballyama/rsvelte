---
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
---

fix(svelte-check): type SvelteKit 3 hooks from `@sveltejs/kit/hooks`. SvelteKit 3 moved `Handle`, `HandleFetch`, `HandleServerError`, `HandleClientError` and `Reroute` out of `@sveltejs/kit`, so the annotations rsvelte-check adds to untyped hooks in `hooks.server`, `hooks.client` and `hooks` files raised TS2694 (and, in JS files, TS7031) where official svelte-check reports nothing. The module is now chosen as upstream chooses it: `@sveltejs/kit/hooks` when the `@sveltejs/kit` resolved from the file is version 3 or later, `@sveltejs/kit` otherwise.
