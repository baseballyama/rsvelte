---
'@rsvelte/cli': patch
---

`compile` and `svelte/valid-compile` raise `props_illegal_name` for a `$$` key of `$props()` and a `$$` member of a rest prop, such as `rest.$$slots`, as Svelte does.
