# `template-local-shadows-derived-var-nested-block.svelte`

**Issue:** corpus residue

The write one block deeper, so the declaration's scope is not the arrow body's. This was the only one of the five that discriminated before the set was corrected, and it discriminated for a reason its own comment did not state — the `w--` write, not the nesting. Kept as the nesting axis with the write made explicit.
