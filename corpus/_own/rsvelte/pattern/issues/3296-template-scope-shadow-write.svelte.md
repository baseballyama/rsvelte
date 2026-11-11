# `3296-template-scope-shadow-write.svelte`

**Issue:** [#3296](https://github.com/baseballyama/rsvelte/issues/3296)

Destructured and nested each-item writes target the owning item, invalidate only its dependency chain, and do not inherit an outer prop's deep-read behavior.
