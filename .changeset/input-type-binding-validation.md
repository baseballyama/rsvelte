---
'@rsvelte/cli': patch
---

A binding on an `<input>` whose `type` is not static text now raises `attribute_invalid_type` as Svelte does. The compiler used to refuse it as unsupported.
