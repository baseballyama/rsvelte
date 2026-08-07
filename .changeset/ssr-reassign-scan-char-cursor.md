---
"@rsvelte/compiler": patch
---

fix(compiler): step the SSR reassignment scan by a character, not a byte

`extract_constant_vars`'s reassignment check advanced its cursor with
`abs_pos + 1`, one byte past a match start. For a non-ASCII variable name that
lands inside the first character, so `<script>let 名前 = 1;</script>` panicked
the server compiler with "byte index is not a char boundary". Advancing by one
character is byte-identical for an ASCII name.
