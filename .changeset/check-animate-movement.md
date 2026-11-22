---
'@rsvelte/cli': patch
---

`rsvelte check` now reports a finding on an `animate:` directive's movement where svelte-check does: at the name's last character only when the start tag's `>` directly follows the name, and at the name's end otherwise.
