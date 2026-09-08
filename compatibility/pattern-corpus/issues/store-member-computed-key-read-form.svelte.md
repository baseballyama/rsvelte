# `store-member-computed-key-read-form.svelte`

**Issue:** corpus residue

A computed member key inside a component `bind:` target keeps its own site's read form (`$key()`, `prop()`, `$.get(local)`), while only the member's object is the untracked store. Recursing into the object and cloning the property left every computed key untransformed.
