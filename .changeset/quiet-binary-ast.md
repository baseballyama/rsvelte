---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

Skip materializing the public component AST for native buffer and envelope APIs whose binary formats do not expose it.
