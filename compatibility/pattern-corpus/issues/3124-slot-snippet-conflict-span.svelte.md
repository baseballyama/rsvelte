# `3124-slot-snippet-conflict-span.svelte`

**Issue:** [#3124](https://github.com/baseballyama/rsvelte/issues/3124)

`slot_snippet_conflict` carried no position at all — `slot_names` stored a placeholder string where upstream stores the `<slot>` node it reports on. The output verdict compares an error's `code` and nothing else, and `code` is saturated, so only the position ratchets can see this
