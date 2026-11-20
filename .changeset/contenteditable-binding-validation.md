---
'@rsvelte/cli': patch
---

A content binding such as `bind:innerHTML` without a static `contenteditable` now raises `attribute_contenteditable_missing` or `attribute_contenteditable_dynamic` as Svelte does. The compiler used to refuse it as unsupported.
