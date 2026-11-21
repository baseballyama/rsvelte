---
'@rsvelte/cli': patch
---

In `typecheck`, a regular expression with no closing slash now ends where TypeScript ends it, at the first unbalanced bracket of its line. The statements after it on that line, such as `$props()`, stay in the component.
