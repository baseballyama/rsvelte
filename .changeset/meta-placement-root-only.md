---
"@rsvelte/compiler": patch
---

Reject `<svelte:head>`, `<svelte:window>`, `<svelte:body>` and `<svelte:document>` inside `{#key}`, `<svelte:element>`, another `<svelte:head>` and `<slot>`, as the official compiler does. Upstream's rule is one test on the immediate parent — `parent.type !== 'Root'` — while rsvelte asked three depth counters whether it was inside an element, a block or a component, and each counter is maintained by its own hand-written list of the containers that increment it. Those four were on none of the three lists. The check now reads a single flag maintained where every container already funnels its children, so a container added later cannot silently opt out of it.
