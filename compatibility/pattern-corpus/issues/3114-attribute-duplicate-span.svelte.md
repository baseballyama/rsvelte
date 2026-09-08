# `3114-attribute-duplicate-span.svelte`

**Issue:** [#3114](https://github.com/baseballyama/rsvelte/issues/3114)

`attribute_duplicate` underlined the attribute's name where upstream passes the whole node, so the span stopped before the value. This is the shape `compatibility/error-known-failures.md` names as canonical for the `end` ratchet, and fixing it retires that cluster
