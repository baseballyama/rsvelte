# `3180-snapshot-position.svelte.js`

**Issue:** [#3180](https://github.com/baseballyama/rsvelte/issues/3180)

`$state.snapshot` in every position the server treats differently, in one `compileModule` unit. The declarator rows carry both a single and a **non-first** declarator, because the strip was a text scan that found the declaration keyword by walking back over the name and so only ever saw the first. The class fields, the object property, the `return` and the `this.x =` assignment are the other direction — they must all KEEP the `$.snapshot` wrap the declarators lose, and a file with only one direction cannot tell a missing strip from a missing wrap
