# `3234-use-store-name-control.svelte`

**Issue:** [#3234](https://github.com/baseballyama/rsvelte/issues/3234)

The control: `use:$store` was already correct. It is what identified this as one missing call rather than a missing feature, and it fails if the shared helper regresses
