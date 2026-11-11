# `state-referenced-locally-declaration-tag-bind.svelte`

**Issue:** warning probe

Upstream gates `state_referenced_locally` on `state.function_depth === binding.scope.function_depth`, and pins the template's `state.function_depth` to the scope `create_scopes` seeds — which is the PARENT of the root fragment, so a `{let … = $state()}` binding is always at least one level deeper and a plain template read of it can never satisfy the equality. rsvelte collapsed those two levels into one scope, so every synchronous `bind:` read of a declaration-tag binding warned where official is silent — measured at `{#if}`, `{#each}` and the template top level, which is why all three are here. The must-warn control is in the same file: `{let copy = seed}` reads another declaration tag synchronously and both compilers report it, so an over-wide fix that silences the whole template shows up as a MISSING warning rather than as nothing.
