# `3101-props-invalid-pattern-message.svelte`

**Issue:** [#3101](https://github.com/baseballyama/rsvelte/issues/3101)

A quoted key in a `$props()` destructure is rejected by both compilers with the same code and span but a different message — rsvelte carried its own wording. The error gate ratchets `message` apart from `code` for exactly this: `code` is saturated at 0 divergences over 3,802 both-reject pairs
