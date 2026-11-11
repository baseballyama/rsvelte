# `3039-value-attribute-known-defined.svelte`

**Issue:** [#3039](https://github.com/baseballyama/rsvelte/issues/3039)

`value={…}` attributes whose expression is a **known-defined literal** (`'c'`, `42`, a static template) must skip the `?? ''` guard while object/array literals keep it (upstream evaluates them UNKNOWN) — rsvelte's defined-ness classifier missed the raw-literal variants and inverted both directions
