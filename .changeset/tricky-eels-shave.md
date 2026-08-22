---
'@rsvelte/compiler': patch
---

Split a directive name on `|` for every directive kind, and compare a modifier list rather than searching it.

- `use:`, `class:`, `animate:` and `let:` kept the modifier inside the emitted name, so `use:action|once` lowered to `action|once?.($$node)` and `class:active|once` applied a class literally named `active|once`.
- An unknown `style:` modifier is now rejected on `<svelte:body>`, `<svelte:window>` and `<svelte:document>` as it already was on a regular element, and a repeated `|important|important` is rejected everywhere.
- A repeated `on:click|once|once` on a component is now rejected with `event_handler_invalid_component_modifier`, matching `<svelte:component>`.
