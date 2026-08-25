---
'@rsvelte/compiler': patch
'@rsvelte/language-server': patch
---

Report an unknown `{#...}` block at its opening type with `expected_block_type`, matching the official compiler instead of deferring the error until a later closing tag. Keep language-server features available on malformed templates by falling back to their instance script, module script, or an empty TypeScript shadow.
