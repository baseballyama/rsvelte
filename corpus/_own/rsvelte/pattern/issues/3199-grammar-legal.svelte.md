# `3199-grammar-legal.svelte`

**Issue:** [#3199](https://github.com/baseballyama/rsvelte/issues/3199)

The control: `with { type: 'json' }`, plus `using` as a variable name and `using` / `source` / `defer` as property keys. A scan keyed on the word rather than on the declaration kind rejects all four
