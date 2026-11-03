---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(compiler): follow Svelte 5.57.3 (sveltejs/svelte#18859) in dev mode: a comment in front of an `await` — including a JSDoc cast such as `/** @type {T} */ (await load())` — now stays on the `await` inside `(await $.track_reactivity_loss(…))()` instead of moving onto the awaited operand.
