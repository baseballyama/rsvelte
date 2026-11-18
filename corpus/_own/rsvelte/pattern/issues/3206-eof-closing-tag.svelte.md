# `3206-eof-closing-tag.svelte`

**Issue:** [#3206](https://github.com/baseballyama/rsvelte/issues/3206)

`</` with nothing after it. Upstream runs out of input inside the name read, before any closing-tag rule applies, so it is `unexpected_eof` and not the `element_invalid_closing_tag` the empty name would otherwise produce
