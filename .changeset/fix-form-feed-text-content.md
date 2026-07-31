---
"@rsvelte/compiler": patch
---

fix(compiler): treat a form feed as text content rather than whitespace, matching upstream's `[ \t\r\n]` whitespace patterns, and drop trailing whitespace at EOF in the parser the way `template.trimEnd()` does
