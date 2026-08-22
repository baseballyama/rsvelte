---
'@rsvelte/compiler': patch
---

Reject `$$props` and `$$restProps` in runes mode with `legacy_props_invalid` / `legacy_rest_props_invalid`, which were not implemented — they used to compile into references to globals that do not exist
