# `2598-escaped-backslash-statement-boundary.svelte`

**Issue:** [#2598](https://github.com/baseballyama/rsvelte/pull/2598)

A string literal whose last escape is `\\`, followed by an `export` declaration — the client instance-script scanner asked "is the byte before this quote a backslash" instead of "is this quote escaped", so the string never closed, the statement never completed, and the `export` was accumulated into it and emitted verbatim inside the component function, which is not JavaScript
