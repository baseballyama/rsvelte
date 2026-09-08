# `3228-derived-unknown-control.svelte`

**Issue:** [#3228](https://github.com/baseballyama/rsvelte/issues/3228)

The negative control: `$derived([])` has no `Evaluation` arm upstream, so it is UNKNOWN and must stay reactive. Without it a fix that calls every derived known would score green
