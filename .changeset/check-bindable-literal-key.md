---
'@rsvelte/cli': patch
---

In `typecheck`, name a bindable prop whose key is a number or a `BigInt` as the compiled component does, `16` for `0x10` and `10` for `10n`, instead of by the key's source text.
