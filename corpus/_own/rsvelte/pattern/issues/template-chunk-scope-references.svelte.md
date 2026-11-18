# `template-chunk-scope-references.svelte`

**Issue:** corpus residue

A legacy text chunk whose call expression reads an each-local `{@const}` must retain Phase 2's scope-resolved binding references. Rebuilding only the metadata flags forces the dependency builder onto its name-based fallback and drops the getter before `$.untrack(...)`, so the derived text no longer reacts to the local value.
