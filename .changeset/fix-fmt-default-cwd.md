---
"@rsvelte/fmt": patch
---

fix(fmt): default to the current working directory when no paths are given, matching `oxfmt`

`rsvelte-fmt` (no arguments) now formats the current directory in place, and
`rsvelte-fmt --check` checks it, exactly like `oxfmt`. Previously the path
argument was required and the no-path invocation exited with an error.
`--stdin` mode is unaffected.
