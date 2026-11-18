# `3401-type-selector-case.svelte`

**Issue:** [#3401](https://github.com/baseballyama/rsvelte/issues/3401)

Upstream compares a type selector to an element name with `toLowerCase()` on **both** sides, so `DIV` matches `<div>`. rsvelte compared them exactly in the prune path, pruned the rule and raised a `css_unused_selector` official does not — the component silently loses the rule. `:is(DIV)` is the row a `css.code` check cannot see: the emitted text is byte-identical and only the warning set differs
