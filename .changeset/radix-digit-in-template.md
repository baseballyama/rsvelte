---
'@rsvelte/cli': patch
---

`compile` now reports `expected_token` for a digit a binary or octal number does not take in a template expression, such as `{0b12}`, where svelte does.
