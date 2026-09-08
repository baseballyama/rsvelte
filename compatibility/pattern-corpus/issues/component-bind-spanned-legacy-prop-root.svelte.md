# `component-bind-spanned-legacy-prop-root.svelte`

**Issue:** [#4027](https://github.com/baseballyama/rsvelte/pull/4027)

A component `bind:` setter whose member chain starts at a spanned legacy prop must still recognize the root as a prop and call its setter instead of assigning through the getter result.
