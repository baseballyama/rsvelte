---
"@rsvelte/compiler": patch
---

Stop the source-map column walk from panicking on a multi-byte character. The effect-callback mapping generator advanced its two cursors one **byte** at a time and emitted a mapping at every step, so a `—` anywhere the walk reached produced an offset one byte into the character and `offset_to_line_col_utf16` sliced it mid-character. It now steps by whole characters and compares characters rather than bytes, which is byte-identical on ASCII input. The crash was only the visible tip: on ASCII-only input the same off-by-one cursor silently emitted a wrong column, so `offset_to_line_col_utf16` now also asserts that the offset it is handed is a char boundary.
