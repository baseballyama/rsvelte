---
"@rsvelte/fmt": patch
---

fix(fmt): charge an indentation tab `tabWidth` columns when measuring print width. Prettier's `generateIndent` counts one indent tab as `tabWidth` columns, but every fit decision in the formatter measured it with `UnicodeWidthStr::width`, which returns 1 — so under `useTabs` a depth-`n` indent under-counted by `(tabWidth - 1) * n` columns and prose fills, open-tag breaks and `{expr}` splits all fired later than the oracle's. All ~60 width call sites now go through one shared `visual_width(s, tab_width)` helper (and the doc printer carries its indent unit's real column cost), which leaves space-indented output byte-identical.
