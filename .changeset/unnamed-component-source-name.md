---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(compiler): an unnamed `compile()` names its source `(unknown)`, not `input.svelte`. `validate_options` replaces an absent `filename` with `(unknown)` before anything reads it, so upstream's `get_source_name(filename, output_filename, fallback)` never sees an absent filename and its `fallback` argument is unused in the body — rsvelte's port kept the argument and used it, so `js.map.sources` came back `["input.svelte"]` where upstream says `["(unknown)"]`, and `["../input.svelte"]` where upstream says `["../(unknown)"]` (#4704). The parameter is gone, so no caller can reintroduce the dead default; the CSS map and the preprocessor remap path took the same substitution.
