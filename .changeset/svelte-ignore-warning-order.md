---
'@rsvelte/compiler': patch
---

Emit `svelte-ignore` comment-code warnings (`legacy_code` / `unknown_code`) while walking the annotated node instead of batching them before the fragment walk, so they interleave with the surrounding warnings in the same order as the official compiler
