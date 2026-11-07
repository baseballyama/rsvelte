---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(compiler): a `{const x = $derived(…)}` or `{let x = $state(…)}` declaration tag now reads, updates and passes `x` through `$.get` on the client even when another binding in the component (an `{#each}` context, a function parameter, or an instance binding the `$derived` tag shadows) has the same name.
