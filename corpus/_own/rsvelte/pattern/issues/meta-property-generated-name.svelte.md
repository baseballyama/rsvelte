# `meta-property-generated-name.svelte`

**Issue:** corpus residue

The `meta` in `import.meta` and both halves of `new.target` are name slots, not identifier references. They must not enter `ScopeRoot.conflicts` and unnecessarily rename the generated local for a `<meta>` element to `meta_1`.
