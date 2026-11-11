# `3256-concatenated-is.svelte`

**Issue:** [#3256](https://github.com/baseballyama/rsvelte/issues/3256)

An HTML `is` attribute whose concatenated value folds to a string is emitted in the template. The routing decision must inspect `build_attribute_value`'s result rather than only a single source text chunk.
