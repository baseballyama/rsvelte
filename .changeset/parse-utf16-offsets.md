---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(parse): emit AST spans as UTF-16 code-unit offsets, not UTF-8 byte offsets. `parse_svelte` (WASM), `parse` (native), and `parseEnvelope` (native raw-transfer) emitted node `start`/`end` (and `loc` `column`/`character`) as UTF-8 byte offsets, while `svelte/compiler` and the whole JS ecosystem (`magic-string`, `svelte-eslint-parser`, every `String.slice` consumer) use UTF-16 code-unit offsets. For ASCII source the two coincide, but the moment a source contains a non-ASCII character (e.g. Japanese UI strings) before a node, every later span was shifted by `byteLen − utf16Len` — producing wrong slices or a hard `magic-string` "end is out of bounds" crash. All three parse output surfaces now remap byte → UTF-16 on the way out (reusing the same converter the legacy AST path already applied), so `source.slice(node.start, node.end)` is correct regardless of preceding non-ASCII content. ASCII source keeps its fast path (the remap is skipped entirely). Closes #793.
