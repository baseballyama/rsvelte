---
'@rsvelte/cli': patch
---

`rsvelte check` no longer types a component as `void` when a stray `}` in its script closes the render function before its return. Like svelte2tsx, it types that component by the export helper's constraints, so an importer can pass any prop.
