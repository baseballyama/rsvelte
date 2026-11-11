# `3201-template-strict-proto.svelte`

**Issue:** [#3201](https://github.com/baseballyama/rsvelte/issues/3201)

A duplicate `__proto__` in an **attribute value**, so the slot is not the text tag the other files use — the parse function is shared but the callers are not, and each one recomputes the reported position separately
