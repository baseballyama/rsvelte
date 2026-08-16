---
"@rsvelte/compiler": patch
---

Fail `print` instead of erasing what its ESTree fallback cannot represent: an unsupported node type was substituted with a `/* unknown */` comment and returned as a successful print, which dropped 255 nodes across 167 of the 4,369 printable `.svelte` files in the Svelte test suite (228 of them legacy `$:` labelled statements).
