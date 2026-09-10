# `fits-first-break-opportunity.svelte`

**Issue:** [#4309](https://github.com/baseballyama/rsvelte/issues/4309)

An inline element glued to a breakable mustache was measured against the mustache's outermost-group head (`{record.holders`), so `<span class="label">Label text</span>{record` overflowed and the span's hug broke where the oracle keeps it and breaks the mustache after `record`. prettier's `fits` stops at the first `line` of any group it reads in break mode, which is the expression's first break opportunity; `fits` now charges that head whenever the mustache carries its source. Committed in the oracle's formatted form; on the tree without the fix the span's `>` moves to its own line.
