---
"@rsvelte/compiler": patch
---

Raise the three `<svelte:options>` diagnostics from one walk of the attribute list, as upstream does. `options_deprecated_accessors` now fires in runes mode (it never did), `options_deprecated_immutable` carries the attribute's span instead of no position at all, `customElement={null}` warns `options_missing_custom_element` again, and the three come out in the source order of the attributes rather than in the order the checks happened to be written.
