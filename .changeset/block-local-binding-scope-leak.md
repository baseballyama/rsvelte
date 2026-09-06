---
'@rsvelte/compiler': patch
---

fix(analyze): a block-local binding no longer answers for a reference outside its block

`ScopeRoot`'s scope 0 is intentionally polluted with every child-scope
declaration, so a name-keyed lookup resolves an `{#each}` item or index or an
`{#await}` value or error for a reference nowhere near its block. Phase 2 then
recorded that reference on the block-local binding, which is what
`binding_at_reference` replays — so even the position-keyed resolution phase 3
prefers inherited the wrong answer, and a later `{code}` came out wrapped in
`$.template_effect` where upstream writes `text_1.nodeValue` once.

`ScopeRoot::is_block_local_out_of_scope` is the one place that decides it, and
both phase-2 reference writers consult it: `visitors/identifier.rs` and the
`find_binding_any_scope` fallback in `visitors/shared/utils.rs`, of which only
the second was reached on the reported input. The phase-3 name fallback in
`identifier_has_reactive_state` needs the same guard — measured by ablating each
half on its own, neither fixes the grid alone.

Measured over 139,528 corpus pairs (34,885 files x 4 targets), with both arms
built from one commit: 12 moved, `MISMATCH -> match` 3, `match -> MISMATCH` 0.
