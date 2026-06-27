---
"@rsvelte/compiler": patch
---

fix(transform): don't count a member-property key as a reactive assignment

`is_assigned_anywhere_in_body` matched a `.name = ` member-property write
(`obj.name = name`) as an assignment to the `name` binding, adding a spurious
assignment edge that reordered unrelated `$:` reactive blocks. A name preceded by
`.` is a member-property key, not a binding assignment, and is now excluded —
restoring the official source-order emission.
