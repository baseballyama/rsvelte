---
'@rsvelte/compiler': patch
---

A name bound by a `function` declaration folds to a known function, so the dev-mode `$.assign` wrap is skipped for it as it already is for an arrow
