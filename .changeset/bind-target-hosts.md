---
"@rsvelte/compiler": patch
---

Run one `bind:` target rule for every host, as the official compiler does. Three hand-written copies had drifted: `<svelte:window>` / `<svelte:document>` / `<svelte:body>` reported the "Possible bindings for …" sentence for a violation whose message should list the valid elements; `<svelte:element>` answered `bind:group` and `bind:checked` with an `<input>`-specific message; and neither reached the contenteditable requirement, so `bind:innerHTML` without a `contenteditable` attribute compiled where the official compiler rejects it.
