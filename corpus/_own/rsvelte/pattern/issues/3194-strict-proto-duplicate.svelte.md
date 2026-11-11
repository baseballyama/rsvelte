# `3194-strict-proto-duplicate.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

Two `__proto__` data properties in one object literal. The legal file carries the three shapes that do NOT count — shorthand, accessor and computed — which is what stops this from becoming an over-rejection
