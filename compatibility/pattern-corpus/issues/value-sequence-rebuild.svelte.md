# `value-sequence-rebuild.svelte`

**Issue:** [#4311](https://github.com/baseballyama/rsvelte/issues/4311)

The whole-value attribute model built each interpolation's broken form at doc-build time on a budget derived from the builder's running column, the first line's room, and nothing re-checked it against the indent the continuation lines print at, so `{session?.user?.email}` crossing the wrap of a `message="…"` value split at every `?.` where the oracle keeps `?.user?.email}'"` on one continuation line. Each interpolation now carries its source, the printer rebuilds it at the attribute's real indent, `fits` charges it up to its first break opportunity, and the closing `"` is charged only by a measurement that reaches the value's end. Committed in the oracle's formatted form; on the tree without the fix the chain is split once more.
