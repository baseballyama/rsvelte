---
"@rsvelte/fmt": patch
"@rsvelte/compiler": patch
"@rsvelte/language-server": patch
---

chore(deps): update oxfmt to 0.67.0 and the pinned oxc crates to 0.149

The embedded CSS engine no longer pads the comma in a custom property's list value, so
`--arr: [1 , 2]` now formats as `--arr: [1, 2]`, matching `oxfmt` itself.
