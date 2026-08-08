---
'@rsvelte/compiler': patch
---

Emit a string literal in a template expression with its source spelling, not the printer's. `{@const t = 'a\tb'}` compiled to a real tab inside the string and `'\x41'` to `'A'` — the same value, different text, and a divergence from official on every escape the printer does not re-emit. esrap writes a literal's `raw` whenever it is set, so quote style and escape spelling both come from the source; rsvelte kept `raw` only for double-quoted literals.
