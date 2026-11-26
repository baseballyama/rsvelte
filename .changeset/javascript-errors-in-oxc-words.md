---
'@rsvelte/cli': patch
---

`compile`, `check` and `lint` now report a JavaScript syntax error (`js_parse_error`) with oxc's message and position. They no longer try to copy acorn's, which Svelte uses. rsvelte still rejects the same sources as Svelte does and still raises the same Svelte errors around them.
