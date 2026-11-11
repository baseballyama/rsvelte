# `2304-element-block-template-effect-deps.svelte`

**Issue:** [#2304](https://github.com/baseballyama/rsvelte/issues/2304)

An element whose children are wrapped in a `{ … }` block (because it contains a `{#snippet}` or a `{const}`) must pass the memoizer's `$0`/`$1` parameters **and** its deps array to the block's `$.template_effect` — the body already references them, so dropping either throws a `ReferenceError`; the `{const}` case additionally scopes a fresh memoizer to the block
