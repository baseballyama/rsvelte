---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

With `experimental.async`, wrap a component, `{@render}` or element whose props / attributes read an async `{const}` / `{@const}` binding of the same block in `$$renderer.async_block` / `$$renderer.async`, as the official compiler does. Server rendering used to read the binding before `$$renderer.run` assigned it and threw `TypeError: v is not a function`.
