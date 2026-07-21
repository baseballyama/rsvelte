---
"@rsvelte/fmt": patch
---

fix(fmt): exit 2 with oxfmt's own message when no files match, instead of a false success

`rsvelte-fmt` (e.g. run against an empty directory) now exits 2 with
`Expected at least one target file. All matched files may have been excluded
by ignore rules.` — the same exit code and message `oxfmt` gives when it
finds nothing to format. Previously it printed a different message and
exited 0, silently reporting success. `--check` behaves the same way.
