---
'@rsvelte/cli': patch
---

Svelte constant folding converts strings such as `"0x+1"`, long hex strings and large `ToInt32` inputs as JavaScript does.
