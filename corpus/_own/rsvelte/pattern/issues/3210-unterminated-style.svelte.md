# `3210-unterminated-style.svelte`

**Issue:** [#3210](https://github.com/baseballyama/rsvelte/issues/3210)

An unclosed `<style>`, whose `eat('</style', true)` runs against the same trimmed template — a different raising site from the comment, reached through the CSS reader rather than the markup one
