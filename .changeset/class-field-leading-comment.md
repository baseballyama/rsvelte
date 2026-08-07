---
"@rsvelte/compiler": patch
---

Keep a `//` comment written above a private rune class field above the field

`// c` on its own line before `#n = $state(0)` was emitted as `#n = // c` followed by
`$.state(0)` on the next line, moving the comment into the initializer. Upstream's
`ClassBody.js` rebuilds every rune field as `b.prop_def(key, value)` and esrap re-attaches
the comment to the first node that still carries a source range: a private field reuses its
own ranged key, so the comment stays above the field. A public field is rebuilt around a
synthesized `#name` key that has no range, so its comment does legitimately land after the
`=` — that placement is unchanged.
