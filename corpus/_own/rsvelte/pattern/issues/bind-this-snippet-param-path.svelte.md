# `bind-this-snippet-param-path.svelte`

**Issue:** corpus residue

A computed path element is a read of its binding, so it carries the same transform an ordinary reference would. `build_bind_this` overrides that to identity for the each-block context variables it passes in as setter parameters and for those only, so a snippet parameter must still report `depth()`.
