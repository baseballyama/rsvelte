---
'@rsvelte/cli': patch
---

`rsvelte check` no longer reports a component as `void` wherever it is used when a stray `}` in its script closes the render function early. Like svelte2tsx, it types the component by the export helper's constraints, so an importer can pass any prop.
