---
'@rsvelte/cli': patch
---

In `typecheck`, read on after an unterminated regular expression in a component script where TypeScript does, at the first unbalanced bracket of its line, so the statements after it on that line, such as `$props()`, are kept.
