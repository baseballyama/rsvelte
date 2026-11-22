---
'@rsvelte/cli': patch
---

`rsvelte check` now reports a finding on an `animate:` directive's movement where svelte-check does. That is the name's last character when the start tag's `>` directly follows the name, and the name's end otherwise.
