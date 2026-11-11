# `global-ampersand-in-a-nested-rule.svelte`

**Issue:** [#4393](https://github.com/baseballyama/rsvelte/issues/4393)

A bare `:global` opening a nested relative selector is replaced by `&`, not deleted — upstream ANDs three conditions (`3-transform/css/index.js:288-296`), so the row crosses a plain, a `.p :global` and a bare `:global` parent against `:global .a`, `:global.a`, `:global > .a` and the three controls that must gain nothing: a leading combinator, an argument list, and no parent rule at all.
