---
'@rsvelte/cli': patch
---

`rsvelte format` now takes the options of the nearest oxfmt or Prettier configuration, as the 0.2.0 notes said; 0.2.0 shipped without this change and formatted with Prettier's defaults.
