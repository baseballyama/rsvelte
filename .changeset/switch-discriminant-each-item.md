---
"@rsvelte/compiler": patch
---

Unwrap each-item signals read inside a `switch` statement. The client identifier
transform had no `SwitchStatement` arm, so the discriminant, every `case` test
and every consequent statement were emitted against the raw signal object — no
`case` ever matched, in both dev and prod builds, with no error or warning.
