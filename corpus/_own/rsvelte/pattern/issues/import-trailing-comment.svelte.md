# `import-trailing-comment.svelte`

**Issue:** [#4668](https://github.com/baseballyama/rsvelte/issues/4668)

ASI ends a semicolon-free `import` at its module specifier, and a comment after
the specifier is not part of the statement. The client extractor decided the
statement's end by comparing the specifier's offset to the end of the *line*,
so a trailing comment left the import looking unfinished and the next line was
merged into it: the emitted module was `import x from "m" let n = $state(x);`,
which no parser accepts, and the declaration never reached the component
function. The missing semicolon and the comment are both the payload, so this
file is deliberately not in formatted shape. The cells that separate ending the
statement from continuing it — an import-attributes clause on the next line, a
comment inside a multi-line specifier list — are in
`crates/rsvelte_core/tests/import_trailing_comment_4668.rs`.
