---
'@rsvelte/cli': patch
---

`rsvelte format` now formats the other files when it cannot read or honor one configuration. It leaves the files of that configuration, names it, and exits with 2.
