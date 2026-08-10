---
"@rsvelte/compiler": patch
---

Scope elements reached through `:root<compound>:has(...)` selectors. The CSS
rule was retained but its matching element missed the component scope class,
making the emitted rule inert.

Apply an outer scope class to compounds containing multiple functional
`:is()` / `:where()` pseudo-classes instead of treating them as a standalone
pseudo-class selector.
