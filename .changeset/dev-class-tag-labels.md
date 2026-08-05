---
"@rsvelte/compiler": patch
---

Report the field name as written in dev-mode class `$.tag()` labels. A public `count = $state(0)` is lowered to a private backing field plus an accessor pair, so the label has to be recovered from the accessor rather than read off the backing field — otherwise a public `count` reported `Counter.#_count` and a genuinely private `#count` lost its `#`.
