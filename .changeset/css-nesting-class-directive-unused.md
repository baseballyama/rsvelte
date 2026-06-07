---
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
---

fix(css): don't flag a nested `&.CLASS` selector as unused when `CLASS` comes from a `class:CLASS={...}` directive (or a spread) rather than a static `class="..."` attribute (#720)
