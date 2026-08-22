---
"@rsvelte/compiler": patch
---

Decide `[class~="…"]` the way the official compiler does, in both directions. A `<svelte:element>` contributed only its class names to the CSS matcher, so every other attribute selector — `[data-x]`, `#id`, `[class~=…]` — was decided as if the element had no attributes at all and a matching rule was dropped. Its attribute list is now collected exactly as a regular element's is. In the other direction, a `class:` directive suppressed the whole selector whatever its name; upstream matches a directive under `~=` only when the directive name equals the expected value.
