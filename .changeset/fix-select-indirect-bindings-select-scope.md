---
"@rsvelte/compiler": patch
---

fix(analyze): resolve legacy `<select bind:value>` indirect bindings from the select's containing scope, so an each-item wrapping the select (e.g. `{#each columns as col}<select bind:value={sel[col.key]}>`) is invalidated on mutation; a `$store` bind root is skipped like upstream
