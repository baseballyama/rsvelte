---
"@rsvelte/compiler": patch
---

Scope elements reached through `:root<compound>:has(...)` selectors. The CSS
rule was retained but its matching element missed the component scope class,
making the emitted rule inert.
