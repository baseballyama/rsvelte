---
'@rsvelte/cli': patch
---

`typecheck` reads the language of a component svelte2tsx rejects, such as one with a template expression error, off its script elements, as svelte-check does. Before, it read every such component as JavaScript.
