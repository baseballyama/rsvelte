# `3116-animate-else-fallback.svelte`

**Issue:** [#3116](https://github.com/baseballyama/rsvelte/issues/3116)

An `animate:` in an `{#each}`'s `{:else}` fallback is legal on the same terms as one in the body — upstream reads the parent's key and **body** child count for it — and rsvelte rejected it, because the each frame was popped before the fallback was analysed
