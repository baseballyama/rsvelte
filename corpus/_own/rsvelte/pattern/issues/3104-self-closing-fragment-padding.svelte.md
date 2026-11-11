# `3104-self-closing-fragment-padding.svelte`

**Issue:** [#3104](https://github.com/baseballyama/rsvelte/issues/3104)

svelte2tsx pads the emission around a `<svelte:fragment slot="x" />` to preserve source columns, and the space the self-closing `/` occupies belongs inside the emitted `{}` rather than after the call. The attribute-count variants that still split differently are listed in the issue; only the two shapes here are fixed
