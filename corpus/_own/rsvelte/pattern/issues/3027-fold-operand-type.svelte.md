# `3027-fold-operand-type.svelte`

**Issue:** [#3027](https://github.com/baseballyama/rsvelte/issues/3027)

The rest of the same representation, in the direction the fold DOES emit: a string rendering is not a JS value, so `typeof '0'` printed `number`, `typeof null` printed `undefined`, `'0' + 0` printed `2`, `'0' === 0` printed `true` and `'10' < '9'` printed `false`. Every one parses and every one is silently the wrong text — only output equality can see them
