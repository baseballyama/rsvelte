---
"@rsvelte/compiler": patch
---

End an unquoted attribute value at `"`, `'`, `` ` ``, `<` and `=` as well as at whitespace, `>` and `/>`, mirroring upstream's `regex_invalid_unquoted_attribute_value`. rsvelte read one run of characters up to whitespace or `>`, so `<div data-x=a<b>` produced a single attribute valued `a<b` where official produces `data-x="a"` plus an attribute named `<b`, and start tags official rejects (`data-x=a=b`, `data-x=a"b`, `data-x=a</b`) compiled. A top-level `<script>`/`<style>` keeps the narrower `read_static_attribute` set. The `<` that ends a value is also read as the next attribute's name, as upstream does, so a missing `>` after it is reported past that name instead of at the `<`.
