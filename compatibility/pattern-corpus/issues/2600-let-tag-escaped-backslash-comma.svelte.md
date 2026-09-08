# `2600-let-tag-escaped-backslash-comma.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

The same splitter reached through `{let …}` inside a block rather than a top-level `{const …}`, which is a different call path (`body_has_top_level_comma` in the client visitor, not only the parser's `split_top_level_commas`)
