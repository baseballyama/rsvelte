---
'@rsvelte/compiler': patch
---

Raise `directive_missing_name` for every directive kind. `style:`, `animate:`, `let:` and `on:` with an empty name compiled; `bind:` raised `bind_invalid_name` at a different span. The check now lives once, where upstream keeps it.
