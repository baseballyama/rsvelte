---
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(vite-plugin-svelte-native): re-export `parse`/`parseEnvelope` and ship the envelope decoder. The NAPI binding has always exported `parse` (JSON string) and `parseEnvelope` (raw-transfer Buffer), and both were declared in `index.d.ts`, but `index.cjs` never re-exported them — so at runtime `require('@rsvelte/vite-plugin-svelte-native').parse` and `.parseEnvelope` were `undefined`, leaving the fast standalone parse path (and the ~2x raw-transfer envelope path) unreachable through the public package. On top of that, the `decodeParseEnvelope` decoder the `parseEnvelope` doc references lived in `parse-envelope.js`, which was missing from `package.json#files` and so never shipped. `index.cjs` now re-exports `parse`, `parseEnvelope`, and `decodeParseEnvelope`, and `parse-envelope.js` is added to `files`. Closes #792.
