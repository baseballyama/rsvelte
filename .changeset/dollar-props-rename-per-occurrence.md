---
"@rsvelte/compiler": patch
---

The legacy `$$props` → `$$sanitized_props` rename is decided per occurrence rather
than per line, so a `$$props` written in a comment, a string or a template's text
keeps its spelling, and a genuine read inside a `$.prop(…)` default is no longer
skipped because the generated call shares its line.
