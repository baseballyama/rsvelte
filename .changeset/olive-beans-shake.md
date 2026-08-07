---
'@rsvelte/compiler': patch
---

Advance rejected `find()` matches by a character rather than a byte. A scan that
rejects a match resumed at `abs_pos + 1` — a character step written against a
byte index — and the next `&text[search_from..]` split any needle that begins
with a multi-byte character. `replace_standalone_pattern` is called with needles
like `format!("{var}++")`, whose first character *is* the identifier, so a
member increment on a non-ASCII name (`x.名前++`) panicked. The remaining scans
of this shape were correct only because their needles happen to begin with `.`,
`#`, `(` or `$`; they now share one helper, so that property is no longer
load-bearing and cannot expire with an edit to the pattern.
