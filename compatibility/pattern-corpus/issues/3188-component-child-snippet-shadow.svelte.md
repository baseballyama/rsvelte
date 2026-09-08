# `3188-component-child-snippet-shadow.svelte`

**Issue:** [#3188](https://github.com/baseballyama/rsvelte/issues/3188)

Four component-child snippets whose parameter shadows a component binding — a `$state`, a `$derived`, a destructured plain `let`, one with a default — all of which the SSR constant-folder replaced with the OUTER binding's literal, so every `{@render}` rendered the component's value instead of the argument. The root-level snippet at the bottom is the control: it already shadowed correctly, which is what makes this a drift between two copies of one emitter rather than a missing rule
