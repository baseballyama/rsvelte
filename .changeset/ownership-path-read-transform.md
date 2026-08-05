---
"@rsvelte/compiler": patch
---

Read a computed ownership-path element through its transform in dev, so a slot-let / each-block index reaches `$$ownership_validator.mutation` as `$.get(index)` and a store as `store()`
