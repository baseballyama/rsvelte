# `nested-not-functional-selector-list.svelte`

**Issue:** [#4034](https://github.com/baseballyama/rsvelte/pull/4034)

A selector list nested two functional pseudo-classes deep, under the unscoped simple-`:not()` path. That path rebuilt its selectors without source positions, so the inner `SelectorList` children concatenated and `:has(.key, .keys)` silently became the different selector `:has(.key.keys)`. The same list directly inside `:has()` already retained its comma, which isolates the source-context handoff rather than parsing.
