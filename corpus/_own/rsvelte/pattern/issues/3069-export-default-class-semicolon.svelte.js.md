# `3069-export-default-class-semicolon.svelte.js`

**Issue:** [#3069](https://github.com/baseballyama/rsvelte/issues/3069)

esrap prints a module's default-exported class through its expression path, so upstream ends it `};` — for any class, runes or not — and folds a `;` the source already wrote into that terminator instead of printing an empty statement. Invisible to the corpus output gate, whose oxfmt normalization drops a redundant `;` on both sides; the mutation-fuzz gate is what reports it
