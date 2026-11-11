# `3108-foreign-object-namespace.svelte`

**Issue:** [#3108](https://github.com/baseballyama/rsvelte/issues/3108)

`<foreignObject>` switches its children back to the HTML namespace, where whitespace between two elements survives. The SSR visitor read `metadata.svg` alone and dropped it — the two namespace ports in `3_transform/utils.rs` were never called from there
