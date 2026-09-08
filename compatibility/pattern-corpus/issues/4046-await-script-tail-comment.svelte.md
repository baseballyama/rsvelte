# `4046-await-script-tail-comment.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

An instance-script tail comment ahead of an `{#await}`. The promise thunk is the argument upstream flushes it in, but the pending callback that follows is builder-made and bounds nothing — the designated owner has to take every pending comment instead.
