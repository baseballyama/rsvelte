---
'@rsvelte/cli': patch
---

`rsvelte check` no longer skips a component whose instance script has an `export default`. Like svelte2tsx, it removes the `export` of a default function or class, reports the `default` left in its place, and exports a named one by its name. It leaves an interface or an expression as written.
