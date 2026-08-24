---
"@rsvelte/fmt": patch
---

Fix two `rsvelte-fmt` divergences from `prettier-plugin-svelte`. A `let:` value is an **expression**, not a binding pattern — upstream prints it with the same `printJsExpression` as `on:` / `class:` — so `let:row={{ tags: [(head = 'none')] }}` no longer aborts the whole file with a script parse error, and `let:item={{ 'q-x': q }}` / a long destructuring now come back quote-normalised and broken like any other directive value. And a control-flow block child (`{#if}` / `{#each}` / `{#key}`) now force-breaks `<svelte:boundary>` and `<svelte:head>`, which the collapse pass ran no break pass on at all: the boundary breaks into the block shape (upstream's `shouldHugStart` / `shouldHugEnd` reject it by node type), the head into the hug shape.
