# `3026-template-arrow-store-read-in-mutation.svelte`

**Issue:** [#3026](https://github.com/baseballyama/rsvelte/issues/3026)

The doubled read is a **store auto-subscription** (`$s.x`) rather than a prop, on the right of a prop mutation. Both reads place the identifier in callee position, which is the property that makes re-reading destructive; a fix that seals only the prop getter passes the two files above and fails this one
