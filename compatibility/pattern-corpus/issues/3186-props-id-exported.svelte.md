# `3186-props-id-exported.svelte`

**Issue:** [#3186](https://github.com/baseballyama/rsvelte/issues/3186)

`export const uid=$props.id()` emitted `const uid` twice in one scope — output no JS parser accepts, which the output gate reports as an ordinary mismatch and no runtime test can reach. Written **without spaces around the `=`** because the scan that drops the declarator is whitespace-tolerant on the initializer but was anchored on the declaration keyword; the spaced form and the non-exported control both live in the `3181-*` files, and a second `$props.id()` in this file would be `props_duplicate` rather than a second data point
