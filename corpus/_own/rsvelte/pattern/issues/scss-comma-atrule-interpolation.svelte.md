# `scss-comma-atrule-interpolation.svelte`

**Issue:** [#4031](https://github.com/baseballyama/rsvelte/pull/4031)

An SCSS at-rule prelude whose comma-separated branches contain interpolation must not be mistaken for an unterminated CSS declaration. The comma continues the prelude until its block.
