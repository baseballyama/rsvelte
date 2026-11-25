---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reports a finding in a slot prop once, at the `<slot>`, as svelte-check does, instead of refusing the component over the copy in the render function's return.
