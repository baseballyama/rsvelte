# `3134-namespace-and-nesting-placement.svelte`

**Issue:** [#3134](https://github.com/baseballyama/rsvelte/issues/3134)

A namespaced type selector (`svg\|circle`, `*\|div`) printed without its prefix — upstream keeps `name` free of the namespace so matching works and lets the printer read the source, which rsvelte only did for class and id selectors. Paired with `:global(&)`, the one placement of a nesting selector at root that is legal
