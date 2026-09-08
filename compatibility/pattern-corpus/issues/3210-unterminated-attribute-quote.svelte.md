# `3210-unterminated-attribute-quote.svelte`

**Issue:** [#3210](https://github.com/baseballyama/rsvelte/issues/3210)

`<div title="a>{v}</div>` — the quote swallows the rest of the file, so `read_sequence` runs out of input and reports at `template.length`, again the trimmed one
