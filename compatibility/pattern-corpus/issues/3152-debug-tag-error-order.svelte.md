# `3152-debug-tag-error-order.svelte`

**Issue:** [#3152](https://github.com/baseballyama/rsvelte/issues/3152)

`{@debug user.name}` before a misplaced `<svelte:window>`: upstream raises both on the parser, so source position decides, while rsvelte raised the debug one in analysis and lost. The reversed order agrees on both sides, which is why the file has to be this order — a fixture with one error cannot see a rule about which of two wins
