# `3109-boundary-is-a-parent.svelte`

**Issue:** [#3109](https://github.com/baseballyama/rsvelte/issues/3109)

Analysis counted no parent for `<svelte:boundary>`, so a snippet inside a top-level boundary reported `can_hoist`. SSR then emitted its function ahead of the whole template, reversing it against a sibling boundary's same-named snippet — which decides which declaration both boundaries actually use. The first snippet must reference something outside its own parameters and the second must not, or both take one branch and the order agrees by accident
