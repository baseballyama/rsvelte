# `3045-legacy-empty-reactive-void0.svelte`

**Issue:** [#3045](https://github.com/baseballyama/rsvelte/issues/3045)

Legacy byte-parity pair: `$: ;` still emits `$.legacy_pre_effect(() => {}, () => {})`, and under `<svelte:options immutable />` a `$:`-declared variable's backing source spells its default `void 0`, not `undefined`
