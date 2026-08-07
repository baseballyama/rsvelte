---
"@rsvelte/compiler": patch
---

fix(compiler): return a byte offset from `find_colon_at_depth0`

The ternary-branch analysis in `check_identifier_in_statement` sliced its right-hand
side with the position this returned, but the scan counted characters. A ternary
whose true branch assigns a non-ASCII string literal — `cond ? x = "ああa" : x = y` —
panicked with "byte index is not a char boundary". The scan also read a `:` written
inside a comment as the branch separator.
