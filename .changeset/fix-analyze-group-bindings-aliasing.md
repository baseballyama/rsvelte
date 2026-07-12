---
"@rsvelte/compiler": patch
---

fix(analyze): remove aliasing UB from bind:group each-block marking

`mark_group_bindings_in_node` pushed a `*mut EachBlock` (built from `&mut **each`)
onto an ancestor stack and then recursed into `each.body`, keeping a `&mut` borrow
of that same each block's `body` field live. When a descendant `bind:group` matched,
the code dereferenced the raw pointer — including `&mut **each_ptr` to write
`metadata` — while the outer `&mut each.body` was still alive. Under Stacked/Tree
Borrows this is undefined behavior (a `&mut` reborrow overlapping a live parent
`&mut`). No miscompilation had been observed (single-threaded, the writes only touch
`metadata`, and codegen output was correct), but it is UB the optimizer is entitled
to exploit.

Replace the raw pointers with a safe design: the ancestor stack now holds value
snapshots (`start` offset + declared/expression identifiers copied up-front, so no
borrow of `each` is held across the descent), and matched group-binding assignments
are collected into an `FxHashMap<u32, String>` keyed by each block `start`. Each
`EachBlock`'s `metadata` is written back when the traversal unwinds past it, once no
borrow of its `body` is live. Group-name allocation order and the first-assigned
`binding_group_name` semantics are preserved, so compiler output is byte-identical
(verified against the full runtime-legacy suite, which covers every `bind:group`
inside `{#each}` fixture).
