# `3201-template-strict-param-clash.svelte`

**Issue:** [#3201](https://github.com/baseballyama/rsvelte/issues/3201)

Duplicate parameters in an `{#if}` test. A block head is a third caller again, and it classifies a trailing-token failure before it reports a parse error
