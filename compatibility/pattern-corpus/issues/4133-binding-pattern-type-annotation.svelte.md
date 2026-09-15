# `4133-binding-pattern-type-annotation.svelte`

**Issue:** [#4133](https://github.com/baseballyama/rsvelte/issues/4133)

Every place a binding pattern can carry a TS annotation, across both upstream readers: a
catch parameter (identifier and destructured), an each-block context, two `{@const}`s and an
await block's `then` / `catch`. OXC keeps the annotation beside the pattern rather than on it,
so a port that reads only the pattern drops it — and the two readers produce different nodes
(`read_pattern` builds one by hand with no `loc`, `read_declaration` gets one from the parser),
which a single-shape fix gets wrong at the declaration tag.
