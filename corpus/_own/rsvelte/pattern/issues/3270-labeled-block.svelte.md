# `3270-labeled-block.svelte`

**Issue:** [#3270](https://github.com/baseballyama/rsvelte/issues/3270)

The negative control. Upstream's `LabeledStatement` visitor returns without calling `next()` in runes mode, so nothing under a label is lowered at all — opening the gate without this row turns one divergence into two
