---
'@rsvelte/cli': patch
---

The compiler now rejects the attributes svelte rejects. An element's attribute name such as `3aa` or `+` fails with `attribute_invalid_name`. An unquoted value with text and an expression, such as `title=a{b}`, fails with `attribute_unquoted_sequence`. A script fails on a reserved attribute such as `server`, on `module` with a value, and on a `context` other than `"module"`.
