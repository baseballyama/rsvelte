# `3592-backtick-inside-substitution.svelte.js`

**Issue:** [#3592](https://github.com/baseballyama/rsvelte/issues/3592)

The same run mis-terminated by a backtick a `${…}` carries in one of its own opaque runs — a string, a block comment and a regex literal — rather than by a nested template. These reach the fix's other half: inside a substitution the scan has to run the full lexer, not just count braces, and each carrier is a different arm of it
