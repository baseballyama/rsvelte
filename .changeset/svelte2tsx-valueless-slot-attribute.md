---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

A `<slot>` attribute written with no value no longer declares a slot prop.

`handleSlot` skips any attribute whose `value` has no length, and a valueless
attribute's `value` is `true` — so `<slot a b={b} />` types the slot as `{b: …}` and
rsvelte typed it as `{a: …, b: …}`, adding a prop consumers never receive.
