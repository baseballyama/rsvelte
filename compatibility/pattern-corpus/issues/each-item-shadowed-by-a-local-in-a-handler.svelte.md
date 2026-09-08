# `each-item-shadowed-by-a-local-in-a-handler.svelte`

**Issue:** shadow probe

Upstream's `EachBlock` `assign` / `mutate` transforms set `uses_index` on the owning block, which forces the `$$index` callback parameter even when nothing references it — and they reach the item through `scope.get`. rsvelte looked the root up in `each_item_name_flags` by NAME, so a handler declaring `let row = …` over the item emitted `$.each(node, 1, rows, $.index, ($$anchor, row, $$index) => …)` where official emits no `$$index`. It is two sites (the typed and the JSON assignment paths) and the divergence is **client-only** — the server has no such parameter, which is why a server-side check would have read this as clean. The second `{#each}` writes its item from an unshadowed position and must keep `$$index_1`, as the positive control. 0 occurrences in 34,728 corpus entries.
