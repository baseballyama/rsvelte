---
'@rsvelte/cli': patch
---

A number key in a `$props()` pattern with a rest element is now excluded from the rest as a number, as Svelte does, so the rest keeps that prop.
