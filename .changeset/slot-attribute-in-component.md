---
'@rsvelte/cli': patch
---

`typecheck` no longer reports a text `slot` attribute as an unknown prop on a component that fills a slot of its parent component, as svelte-check does. Inside a snippet or a plain element, `slot` stays a prop.
