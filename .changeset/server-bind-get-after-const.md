---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

In server output, emit the hoisted `var bind_get` / `var bind_set` of a component's `bind:x={get, set}` after the enclosing block's `{@const}` and snippet declarations, as the official compiler does, instead of ahead of a `const` they reference.
