---
'@rsvelte/cli': patch
---

`vuelte.compile` imports `shallowRef` once for a component with an `{#await}` block and a prop that keeps its own cell, where its client output imported it twice and did not parse.
