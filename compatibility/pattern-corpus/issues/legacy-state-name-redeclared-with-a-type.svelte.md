# `legacy-state-name-redeclared-with-a-type.svelte`

**Issue:** shadow probe

The same defect through the TypeScript-annotated pattern (`let v: { n: number } = …`), which is a separate scan in the same function. Three of that function's four patterns are exercised by these two files — with-initialiser, no-initialiser, and type-annotated; the no-semicolon form is guarded by the same predicate and is **not** covered here.
