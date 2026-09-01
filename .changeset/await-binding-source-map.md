---
'@rsvelte/language-server': patch
'@rsvelte/svelte2tsx': patch
---

A `{:then}` / `{:catch}` binding keeps its own source-map segments, so a diagnostic, symbol or hover on it reports the identifier's real range instead of a zero-width position at the start of the generated chunk
