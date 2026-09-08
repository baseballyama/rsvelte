# `3148-valueless-class.svelte`

**Issue:** [#3148](https://github.com/baseballyama/rsvelte/issues/3148)

A valueless `class` is upstream's boolean `true`, which the scoping join reads as empty while the emptiness gate reads as present; rsvelte collapsed it to `""` in three separate copies of the rule and lost both halves. The file carries root, nested, in-`<select>` and SVG elements because the nested ones go through a different serializer, and a valueless `hidden` plus an explicit `class=""` as the two negative controls
