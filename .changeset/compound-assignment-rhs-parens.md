---
'@rsvelte/compiler': patch
---

Keep the parentheses around a compound assignment's binary right-hand side. `s += 'a' + x + 'b'` expanded to `$.set(s, $.get(s) + 'a' + x + 'b')`, which evaluates differently from `$.get(s) + ('a' + x + 'b')` whenever the operands mix types.
