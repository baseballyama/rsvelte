# `3194-strict-octal-number.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

`0755` — a legacy octal literal. One file per MESSAGE, because acorn is single-pass and throws on the first violation it reaches: a file carrying two of them can only ever pin the earlier one, and the corpus ratchets compare an error's message and both endpoints separately
