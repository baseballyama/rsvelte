---
"@rsvelte/fmt": patch
---

fix(fmt): exit 2 with oxfmt's own message when no files match, instead of a false success

`rsvelte-fmt` now exits 2 with `Expected at least one target file. All
matched files may have been excluded by ignore rules.` — the same exit code
and message `oxfmt` gives when it finds nothing to format. This covers a
genuinely empty directory as well as a tree whose only files are excluded by
`.gitignore`/`.prettierignore` or don't match any supported extension.
Previously these cases printed a different message and exited 0, silently
reporting success. `--check` behaves the same way.
