---
"@rsvelte/compiler": patch
---

Avoid emitting `$.invalidate_inner_signals` for legacy each-block collections
with no reactive transitive dependencies.
