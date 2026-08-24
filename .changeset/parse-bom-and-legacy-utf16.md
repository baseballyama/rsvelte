---
"@rsvelte/compiler": patch
---

Strip a leading BOM in the three `parse` entry points (`parse`, `parseEnvelope`, the wasm `parse_svelte`), as upstream's `compiler/index.js` does at every public entry. A U+FEFF at offset 0 was template content, so it became an extra `Text` node and every position after it shifted. And fix the legacy `parse()` path converting positions to UTF-16 twice on a non-ASCII source: `convert_to_legacy` already runs the conversion on its own output, so the binding's second pass shrank every span again — `<p>日</p>` reported `html.end` 6 where official says 8.
