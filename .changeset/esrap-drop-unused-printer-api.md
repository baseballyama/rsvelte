---
"@rsvelte/compiler": patch
---

refactor(esrap): drop `rsvelte_esrap` public API that nothing calls. The
synthetic-comment hook, `QuoteStyle`, `PrintOptions::with_quote`,
`PrintOptions::with_indent` and `print_with_map_opts` are removed; each removed
option's default becomes the only behaviour, and the defaults are unchanged, so
printed output is identical. `rsvelte_esrap` is released as 0.10.0 (removing
public items is breaking) and `rsvelte_core` pins the new exact requirement.
