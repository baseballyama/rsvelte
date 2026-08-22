---
"@rsvelte/compiler": patch
---

`<svelte:window>`, `<svelte:document>` and `<svelte:body>` now answer "does this element take arbitrary attributes at all" before validating any individual `bind:`, as upstream's visitors do — so a spread or a non-event attribute alongside an unsupported `bind:` reports `illegal_element_attribute` / `svelte_body_illegal_attribute` rather than `bind_invalid_target`.
