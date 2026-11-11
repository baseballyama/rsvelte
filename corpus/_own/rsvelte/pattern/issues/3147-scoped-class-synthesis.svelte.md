# `3147-scoped-class-synthesis.svelte`

**Issue:** [#3147](https://github.com/baseballyama/rsvelte/issues/3147)

A scoped element with no `class` attribute must have an empty one synthesized so the hash has a key to merge into. rsvelte's synthesizer took `is_scoped` and ignored it. Only `<svelte:element>` shows it — a regular element gets its hash written into the template by another route — so the file pairs a dynamic element with a plain one, plus the spread case that must **not** synthesize
