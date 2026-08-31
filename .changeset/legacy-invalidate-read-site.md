---
"@rsvelte/compiler": patch
---

Read `$.invalidate_inner_signals` bodies at the site that emits them, mirroring `build_getter`: a prop read is no longer re-wrapped into `trails()()`, an each item now reads as `$.get(item)`, and a legacy-state component `bind:` setter carries the invalidation it was missing.
