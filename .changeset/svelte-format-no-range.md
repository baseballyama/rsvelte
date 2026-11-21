---
'@rsvelte/cli': patch
---

The Svelte formatter no longer takes Prettier's `rangeStart` and `rangeEnd`, which oxfmt does not have either. `rsvelte format` never passed them on, so its output does not change.
