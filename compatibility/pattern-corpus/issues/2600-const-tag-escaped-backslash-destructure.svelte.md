# `2600-const-tag-escaped-backslash-destructure.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

The `{@const}` arm of the same scan. It diverges on **server only** — the client arm recovers through a different fallback, which is why the two tags are pinned separately rather than assumed equivalent
