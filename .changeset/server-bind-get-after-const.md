---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

In server output, emit the hoisted `var bind_get` / `var bind_set` of a component's `bind:x={get, set}` after the enclosing block's `{@const}` and snippet declarations, as the official compiler does, instead of ahead of a `const` they reference. The other statements upstream collects in the same place now keep its order too: a `<title>` in `<svelte:head>`, a snippet declared inside a plain element or inside bound content, a dev `<svelte:element>` tag check, and the `let`s and `$$renderer.run(…)` of an async `{@const}` group, including in an element with async attributes and its own `{const}`.
