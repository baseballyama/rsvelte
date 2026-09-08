# `store-member-computed-key-in-event-handler.svelte`

**Issue:** corpus residue

A computed index in a store-member assignment LHS keeps its own site's read transform — `$.untrack($formData)[groupKey()]` for an each item and `[$.get(lastHref)]` for a reassigned `let` — while the store root is replaced by `store_sub_mutate`.
