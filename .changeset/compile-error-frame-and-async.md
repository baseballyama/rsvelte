---
'@rsvelte/compiler': patch
---

Give a compile failure out of `compileWithCssHash` the same official `CompileError` object the synchronous entries throw, and add the rendered `frame` to all of them. The async entry previously surfaced a failure as a Rust `Debug` string with no `code`/`start`/`end`, so a consumer that places a diagnostic from it — `@rsvelte/vite-plugin-svelte`'s `utils/error.js` builds `rollupError.loc` this way — got nothing on that path. Also fixes the code frame's caret column: it was computed without an upper bound and so ran past the end of the quoted line whenever the error's `end` sat on a later line, which affected warning frames as well as error frames.
