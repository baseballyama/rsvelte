---
'@rsvelte/cli': patch
---

The compiler now rejects what svelte rejects in an element's or a script's attributes: a name such as `3aa` or `+` (`attribute_invalid_name`), an unquoted value of several parts such as `title=a{b}` (`attribute_unquoted_sequence`), a reserved script attribute such as `<script server>`, `<script module="…">`, and a `context` other than `"module"`.
