---
"@rsvelte/fmt": patch
---

Stop parenthesizing the head of a markup `as`/`satisfies` cast: `{type as X}` no longer becomes `{(type) as X}`.
