---
"@rsvelte/compiler": patch
"@rsvelte/language-server": patch
---

Reduce WebAssembly size by sharing the compiler's compact JSON serializer for `parse_svelte` and repeating size optimization until it converges. The returned AST JSON no longer includes indentation; its data and UTF-16 positions are unchanged. Compiler features and exports remain available.
