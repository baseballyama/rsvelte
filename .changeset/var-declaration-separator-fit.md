---
"@rsvelte/compiler": patch
---

A synthesized `$state()` destructuring declaration with a default now breaks across lines at the same 50-column boundary esrap uses. The separator spaces between a call's arguments are content upstream measures, and this port materialises them as layout spans, so the declaration measured one byte short per inner separator and stayed on one line at exactly the boundary.
