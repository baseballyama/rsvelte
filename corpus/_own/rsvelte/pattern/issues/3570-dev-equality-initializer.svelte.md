# `3570-dev-equality-initializer.svelte`

**Issue:** [#3570](https://github.com/baseballyama/rsvelte/issues/3570)

Equality expressions reached through binding initializers remain source AST and fold in client dev, while inline equality still follows dev lowering.
