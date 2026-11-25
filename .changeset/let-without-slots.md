---
'@rsvelte/cli': patch
---

`typecheck` reports a `let:` on a component without slots, such as a runes component, as svelte-check does: its slots read as `unknown`. It also reports the `children` of a component's content at the column svelte-check uses when the start tag has a directive.
