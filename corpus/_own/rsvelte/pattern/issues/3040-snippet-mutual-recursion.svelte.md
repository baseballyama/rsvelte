# `3040-snippet-mutual-recursion.svelte`

**Issue:** [#3040](https://github.com/baseballyama/rsvelte/issues/3040)

Two root snippets that `{@render}` **each other** — upstream's `can_hoist_snippet` carries a `visited` set, so the mutually recursive pair hoists (greatest fixed point); rsvelte answered per-snippet without the set and kept both unhoisted
