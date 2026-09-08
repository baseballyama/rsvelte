# `3113-private-field-tag-label.svelte`

**Issue:** [#3113](https://github.com/baseballyama/rsvelte/issues/3113)

The dev-mode `$.tag` label is taken from the key the user wrote, before a public `x = $state()` is lowered into `#x` plus accessors. rsvelte ran after that lowering and reconstructed the answer from the generated setter — which cannot work, because a hand-written private accessor lowers to byte-identical text. The old test separated the two only by the setter's parameter name
