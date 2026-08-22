---
"@rsvelte/compiler": patch
---

Reject the attributes the official compiler rejects on `<svelte:window>`, `<svelte:document>`, `<svelte:body>` and `<svelte:element>`. The first three allow only an event handler with an expression value; rsvelte accepted every attribute on window and document, and on body accepted any name starting with `on` whatever its value. `<svelte:element>` now runs the same `validate_element` as a regular element, as upstream's visitor does, so a non-expression `on*` handler and an illegal attribute name are rejected there too.
