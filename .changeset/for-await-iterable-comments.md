---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(compiler): in dev mode with `experimental.async`, comments around a `for await` loop's iterable now print inside `$.for_await_track_reactivity_loss(…)` the way the official compiler places them, instead of staying outside the wrapper.
