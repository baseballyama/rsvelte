# `named-slot-let-scope.svelte`

**Issue:** corpus residue

A child carrying `slot="name"` is scoped from the component's own scope, not from the `let:` scope, so a `let:` name is not visible inside a named slot and its read is not a legacy dependency. Resolution still reaches the merged root scope, so the divergence returns when no other binding shares the name.
