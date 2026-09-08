# `3206-eof-unterminated-attr.svelte`

**Issue:** [#3206](https://github.com/baseballyama/rsvelte/issues/3206)

`<div title="a"` — the same end-of-input, reached after an attribute rather than after the tag name, so the point is the attribute's end and not the name's
