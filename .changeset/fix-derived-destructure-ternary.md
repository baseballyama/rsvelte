---
"@rsvelte/compiler": patch
---

Fix invalid client output for destructured `$derived` properties whose default value contains a colon (ternary, string literal)
