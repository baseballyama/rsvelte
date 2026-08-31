---
"@rsvelte/compiler": patch
---

Read a store member binding's computed key through the site's transform, so `bind:value={$values[$key]}` emits `$.untrack($values)[$key()]` rather than the raw identifier. The same site covers a prop, a store subscription, legacy state and a member of legacy state.
