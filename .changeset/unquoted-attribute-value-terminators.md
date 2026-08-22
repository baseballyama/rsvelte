---
'@rsvelte/compiler': patch
---

End an unquoted attribute value on `"`, `'`, `=`, `<` and a backtick

An unquoted value was read as one run up to whitespace, `>` or `/>`. The HTML
"attribute value (unquoted) state" — upstream's
`regex_invalid_unquoted_attribute_value` — also ends it on `"`, `'`, `=`, `<`
and a backtick, so `<div data-x=a<b>` produced one attribute where official
produces two, and documents official rejects were accepted.
