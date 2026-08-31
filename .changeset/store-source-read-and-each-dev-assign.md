---
'@rsvelte/compiler': patch
---

Read a store's source binding the same way in all six rewriters, and leave an each-item member mutation out of the dev `$.assign` wrap
