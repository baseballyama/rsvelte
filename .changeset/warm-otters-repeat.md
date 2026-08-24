---
'@rsvelte/compiler': patch
---

Decode `<textarea>` content with the attribute-value entity rule, as `read_sequence` does upstream, so a semicolon-less legacy name like `&notreal;` stays literal instead of decoding its `&not` prefix. The word-boundary guard it uses now also treats `_` as a word character, matching JavaScript's `\b` — `&amp_b` was decoded in every attribute value, not only in a `<textarea>`.
