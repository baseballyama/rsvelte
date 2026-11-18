# `abstract-method-member-alignment.svelte`

**Issue:** corpus residue

An abstract method is a member of the class body, not a hole in it: dropping it at parse shifts every later member up one slot, so a positional comparison reads the wrong pair at every index after it — one dropped `abstract describe()` reported the following `declare` field as both extra and missing. Its `value` is a `TSDeclareMethod` (no `body`, with the `returnType`), and the abstract *property* stays dropped on purpose — see `upstream_issues/3082-svelte-abstract-property-not-erased.md`.
