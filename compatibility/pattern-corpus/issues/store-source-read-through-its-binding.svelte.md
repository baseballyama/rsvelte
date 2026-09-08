# `store-source-read-through-its-binding.svelte`

**Issue:** corpus residue

`$.store_mutate`'s first argument is the store SOURCE, read through its own binding — upstream's `get_store()` is `context.visit(b.id(name.slice(1)))`, so a prop yields `store()`, a reassigned `let` yields `$.get(store)`, and any other binding kind yields the bare name. `store_assign_ast` (`$store = …`) had all three arms and `store_member_mutate_ast` (`$store.prop = …`) had only the prop one, so the same binding was read one way when assigned and another when mutated, passing the signal object where the store belongs. The output parses either way. The three read forms are crossed here in one file because a repro carrying only the reassigned one cannot tell the fix from `$.get(...)` on every store.
