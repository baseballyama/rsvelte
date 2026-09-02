---
"@rsvelte/compiler": patch
---

`$$ownership_validator` is declared for a prop mutation that was SEEN, not only for one that could be wrapped

Upstream latches `analysis.needs_mutation_validation` before it builds the mutation's
property path (`shared/utils.js:406`), so a computed key it cannot spell — anything but an
identifier or a literal — leaves the mutation unwrapped and still emits the preamble.
rsvelte derived the flag from a text scan for `$$ownership_validator.mutation`, which by
construction can only find a mutation that *was* wrapped, so
`object[objectKey ?? key] = v` emitted neither.

A second divergence sat one level further out: `scan_member_chain_names` bailed on a root
wrapped in plain parentheses, because the helper that steps over a parenthesised root only
accepted an `as` / `satisfies` assertion inside them and acorn erases an empty pair. The
two are not orthogonal — the scan builds `PropMutationSites`, which `source_has_member_write`
reads, which gates the latch — so a fix for the index alone is dead on a parenthesised root.
Ablating each half separately measures it: the latch alone falls on 15 of the grid's 24
cells, the root arm alone on all 8 parenthesised ones including the three whose wrap the
latch never touches.
