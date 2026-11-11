# `3188-boundary-snippet-params.svelte`

**Issue:** [#3188](https://github.com/baseballyama/rsvelte/issues/3188)

The third copy of the same emitter. `{#snippet failed({ message }, reset)}` came out as `function failed($$renderer, undefined)` — text no JS parser accepts, from an emitter that reconstructed each parameter from its identifier name and had no name to use. The second boundary adds the shadow half, which this copy also lacked; a file with only the destructuring row would be repaired by fixing the parameters alone
