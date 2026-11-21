---
'@rsvelte/cli': patch
---

In `typecheck`, a bindable prop with a numeric or `BigInt` key now has the name the compiled component gives it. For example, `0x10` is `16` and `10n` is `10`.
