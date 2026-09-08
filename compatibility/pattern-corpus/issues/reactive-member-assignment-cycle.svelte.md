# `reactive-member-assignment-cycle.svelte`

**Issue:** corpus residue

A member assignment such as `data.size = size` does not assign the `data` binding in the legacy reactive dependency graph, avoiding a false `data ↔ size` cycle. A member update such as `data.count++` remains an assignment of the root binding, matching upstream's separate `UpdateExpression` rule.
