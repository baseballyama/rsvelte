---
"@rsvelte/compiler": patch
---

Give the root fragment, the `<svelte:*>` meta elements and `<title>` their own template scope, so a `{@const}` at one of those placements reports `const_tag_invalid_placement` / `svelte_meta_invalid_content` instead of `declaration_duplicate` when its name collides with a script declaration
