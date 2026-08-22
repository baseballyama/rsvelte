---
'@rsvelte/compiler': patch
---

Report an unterminated tag at end of input where the official compiler does: upstream reads the template right-trimmed, so `a<b`, `<div` and `<div title="a"` now point at the last consumed byte instead of one line later, a lone `<` is `unexpected_eof` instead of text, a `<` that starts no tag is `tag_invalid_name`, and `</` at end of input runs out of input before any closing-tag rule applies
