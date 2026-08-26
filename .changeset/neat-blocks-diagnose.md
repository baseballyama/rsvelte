---
'@rsvelte/compiler': patch
'@rsvelte/language-server': patch
---

Report an unknown `{#...}` block at its opening type with `expected_block_type`, matching the official compiler instead of deferring the error until a later closing tag. Return the language server's existing `null` result for invalid block-marker completions before attempting to map them through a projection that the malformed template cannot produce.
