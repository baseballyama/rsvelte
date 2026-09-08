# `3592-nested-template-rune-text.svelte.js`

**Issue:** [#3592](https://github.com/baseballyama/rsvelte/issues/3592)

A template literal nested inside another one's `${…}`. `skip_opaque` scanned a backtick like a quote, so the run ended at the SECOND backtick and the text between it and the third read as code — a rune name there was lowered. The two literals are at nesting depth 2 and 4 because the defect is a parity: depth 1, 3 and 5 were already correct, and a single-depth file cannot tell "no nesting support" from a toggle. The real `$state` / `$derived` in the exported factory pin the other side — they sit AFTER the literals, so a scan that stays lost never reaches them
