---
"@rsvelte/compiler": patch
---

Reject an at-rule whose name is missing or starts with a digit (`@ foo`, `@1x`, `@-1x`) with `css_expected_identifier`. Upstream reads the name with the same `read_identifier` as a type selector, which errors on both; rsvelte built the `Atrule` node from whatever it got.
