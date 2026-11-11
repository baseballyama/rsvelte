# `3199-grammar-import-assert.svelte`

**Issue:** [#3199](https://github.com/baseballyama/rsvelte/issues/3199)

`assert { type: 'json' }`, the withdrawn spelling of an import-attributes clause. OXC's clause span starts at `{`, so the reported offset has to be walked back over the whitespace to the keyword — the legal file's `with { … }` is what proves the walk-back does not fire on the surviving spelling
