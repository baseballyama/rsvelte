# `3175-legacy-derived-server-fold.svelte`

**Issue:** [#3175](https://github.com/baseballyama/rsvelte/issues/3175)

The SSR constant-fold harvested `$derived(<expr>)` declarations by scanning the instance script for the text `$derived(`, on the premise that a derived value is read-only. In legacy mode `$derived` is a store subscription, so the declared value is the call's RESULT and the argument was inlined into the template — output that parses and renders a frozen constant. Three foldable argument shapes (literal, arithmetic, a `const` from `constant_vars`) because the fold has a second pass, plus a `$state` sibling that never folded as the negative control
