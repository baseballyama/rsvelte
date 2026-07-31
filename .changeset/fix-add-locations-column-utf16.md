---
"@rsvelte/compiler": patch
---

fix(compiler): count `$.add_locations` columns in UTF-16 code units instead of bytes, so a non-ASCII character earlier on the line no longer shifts the reported position
