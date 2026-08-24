---
"@rsvelte/compiler": patch
---

Follow upstream's numeric character-reference rules. Its pattern is `#(?:x[a-fA-F\d]+|\d+)(?:;)?`, so an uppercase `&#X41;` is not a reference at all and a digit run longer than rsvelte's private cap is one reference rather than a decoded head plus a literal tail; and upstream bails on a falsy *parsed* code before validating, so a surrogate half or an above-range value still reaches `String.fromCodePoint(0)` and emits a NUL instead of staying literal.
