# `3154-sibling-into-snippet.svelte`

**Issue:** [#3154](https://github.com/baseballyama/rsvelte/issues/3154)

The `{#snippet}` half, kept apart from the `{#await}` half because the two need different fixes: the await one is a per-element question about a walk that already reaches the body, this one needs the walk to leave the body through `{@render}` at all. `.y` and `.z` are rendered from sibling positions and must still match, which is what distinguishes leaving the snippet from not entering it
