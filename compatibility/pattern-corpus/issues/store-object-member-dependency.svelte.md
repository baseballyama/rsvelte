# `store-object-member-dependency.svelte`

**Issue:** corpus residue

A component attribute that reads a method from an imported store object while the same store also has a `$store` subscription depends on `$.deep_read_state(store)`, not on the subscribed `$store()` value. The underlying import and its synthetic subscription are distinct bindings; the mere existence of the latter must not replace dependencies on the former.
