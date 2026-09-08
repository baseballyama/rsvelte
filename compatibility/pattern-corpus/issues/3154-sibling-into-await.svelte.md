# `3154-sibling-into-await.svelte`

**Issue:** [#3154](https://github.com/baseballyama/rsvelte/issues/3154)

Both sibling combinators reaching into an `{#await ... then}` body, in both directions: `.x` inside `.b`'s own body is a descendant and never a sibling, while `.y` / `.z` in a sibling await block genuinely are. The `{#snippet}` half of the issue is not here — it needs the render-site walk and is still open
