# `3208-duplicate-snippet.svelte`

**Issue:** [#3208](https://github.com/baseballyama/rsvelte/issues/3208)

Two `{#snippet}` blocks with one name. A snippet declares with `Function`, which the duplicate check exempts so a TypeScript overload set stays legal — two snippets are not an overload set
