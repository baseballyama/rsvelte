# `3032-async-placeholder-collision.svelte`

**Issue:** [#3032](https://github.com/baseballyama/rsvelte/issues/3032)

User strings carrying the compiler's own internal placeholder tokens (`$$async_hole`, `$$async_noop`, `/* $$inspect_hole */`) — the async post-passes matched them by **substring**, so string data was rewritten as if it were an emitted placeholder statement; matching is now by whole-statement shape
