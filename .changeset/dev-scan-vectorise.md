---
'@rsvelte/compiler': patch
---

Vectorise the two whole-source scans dev-mode prop-mutation validation runs, and stop allocating a name for every identifier the assign-tail scanner rejects
