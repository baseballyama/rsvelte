# `3569-style-attribute-metadata.svelte`

**Issue:** [#3569](https://github.com/baseballyama/rsvelte/issues/3569)

A plain `style` attribute carries the same per-chunk metadata into style lowering: local calls and reactive values still update, while a pure global call does not acquire call metadata merely by being used as an attribute value.
