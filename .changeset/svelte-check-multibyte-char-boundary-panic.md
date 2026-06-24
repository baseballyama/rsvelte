---
"@rsvelte/svelte-check": patch
---

svelte-check: fix a panic (`byte index … is not a char boundary`) when a
generated-TSX diagnostic lands on a line containing multi-byte characters
(e.g. Japanese). `line_col_to_byte_offset` treated the 1-based diagnostic
`column` as a byte offset; for non-ASCII lines that lands mid-codepoint, and
the subsequent `text[off..]` slice in the `Ωignore`-region check panicked.
It now walks char boundaries so the offset is always valid.
