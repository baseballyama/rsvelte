# `3091-snippet-rest-parameter-span.svelte`

**Issue:** [#3091](https://github.com/baseballyama/rsvelte/issues/3091)

`snippet_invalid_rest_parameter` was raised by the parser, so `parse()` rejected a file official's parser accepts and `rsvelte-fmt` / the language server lost the document. Moving it to the Phase-2 `SnippetBlock` visitor also fixed the error's `end`, which was hard-coded to `start + 7`. The corpus file carries the *legal* neighbour — a rest inside an object pattern — since the illegal one has no compiling form
