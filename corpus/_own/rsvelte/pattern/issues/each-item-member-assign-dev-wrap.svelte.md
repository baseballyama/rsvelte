# `each-item-member-assign-dev-wrap.svelte`

**Issue:** corpus residue

`build_assignment` returns on `transform?.mutate` **before** the dev `$.assign` wrap, so an each-item member mutation is not wrapped even in dev. The dev target is the comparison; production is the control.
