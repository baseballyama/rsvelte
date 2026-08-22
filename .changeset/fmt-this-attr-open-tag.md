---
"@rsvelte/fmt": patch
"@rsvelte/compiler": patch
---

Fix two `rsvelte-fmt` outputs that were not the input reformatted. `<svelte:element this={n > 0 ? 'p' : 'span'}>` re-emitted part of the expression as text, because `this={…}` is not in the element's attribute list and the open-tag scan stopped at the `>` inside it; and an expression tag with a trailing comment came out as `{n; /* c */}`, which no longer parses.
