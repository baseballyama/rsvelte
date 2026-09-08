# `3863-await-import-declaration-tag.svelte`

**Issue:** [#3863](https://github.com/baseballyama/rsvelte/issues/3863)

An await block over a dynamic import accepts a `{@const}` declaration whose reducer traverses objects with a `children` property; the property name must not interfere with declaration-tag or block-child handling.
