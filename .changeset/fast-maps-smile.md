---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

Reduce compile overhead by avoiding duplicate analysis setup, allocation-free escaping for static templates, and source-text copies in wrapper-managed source maps.
