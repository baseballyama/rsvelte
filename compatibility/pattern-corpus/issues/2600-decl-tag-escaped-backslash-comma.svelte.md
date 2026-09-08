# `2600-decl-tag-escaped-backslash-comma.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

`{const a = "\\", b = 2}` — the declaration-tag comma splitter is one of 37 scanners that asked "is the byte before this quote a backslash". The string never closed, so the second declarator was swallowed into the first initializer and `b` was never declared; the parser lost it silently, with no error
