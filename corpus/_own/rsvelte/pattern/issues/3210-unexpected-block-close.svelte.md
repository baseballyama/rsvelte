# `3210-unexpected-block-close.svelte`

**Issue:** [#3210](https://github.com/baseballyama/rsvelte/issues/3210)

`{/if}` with no block open. The same one-column shift in `close()`, and a separate raising site: the two share nothing but the `{` they were both reporting
