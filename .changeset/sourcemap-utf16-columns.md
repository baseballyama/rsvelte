---
"@rsvelte/compiler": patch
---

fix(compiler): client source-map columns count UTF-16 units, not UTF-8 bytes

esrap resolved a source position by subtracting a byte line start, so every client-map
column to the right of a character above U+007F was too large — by 2 per CJK character,
by 2 per astral character. Source Map v3 columns are JavaScript string offsets, which is
what the official compiler emits. Generated columns were already correct; the server
port already converted.
