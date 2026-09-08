# `3099-hoisted-type-line-shift.svelte`

**Issue:** [#3099](https://github.com/baseballyama/rsvelte/issues/3099)

svelte2tsx hoists a type/interface above `$$render` by moving the chunk *with* its leading blank lines, so the rest of the TSX shifted up a line. Upstream advances the chunk start one whitespace character past `node.pos` and prepends `;\n`, leaving exactly one break behind. Neither svelte2tsx gate sees it — the text gate normalises through `stripBlankLines` and the map gate only asserts well-formedness
