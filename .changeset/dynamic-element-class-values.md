---
"@rsvelte/compiler": patch
---

Compute the possible class names of a `<svelte:element>`'s `class` attribute the way a regular element's are computed, so `class={a ? 'x' : 'y'}` prunes the selectors it cannot match instead of marking every class reachable. The expansion is now one shared function rather than a copy per element type.
