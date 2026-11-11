# `3144-render-sibling-snippet-in-dynamic-nodes.svelte`

**Issue:** [#3144](https://github.com/baseballyama/rsvelte/issues/3144)

A `{@render}` could not see a `{#snippet}` declared beside it under `<svelte:element>`, `<svelte:component>` or `<svelte:self>`, because only the plain-component visitor entered the template scope the builder had already created. The file carries all three parents: the same omission produced a different symptom under each, and one parent alone would have read as a node-specific quirk
