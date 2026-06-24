---
"@rsvelte/fmt": patch
---

fmt: fix inline `<style>` blocks being mangled in the file (`--write` / `--check`)
path. The batched style pipeline records each raw `<style>` body and emits a
single-line placeholder during the format pass, then formats every body in one
`oxfmt` call and splices the results back. The splice was a plain string
replace, so the in-process formatter's re-indentation never reached the
multi-line CSS: every line after the first stayed at column 0 and `oxfmt`'s
trailing newline leaked in as a blank line before `</style>`. On a real corpus
this diverged ~33% of components from the `--stdin` path (which re-indents
correctly). The splice now re-indents with the same routine the single-file /
stdin path uses, so both paths are byte-identical.

The batch also formatted every `<style>` body at the base print width, so a
column-sensitive long selector or value wrapped differently from `oxfmt` (which
narrows by the block's indentation). Bodies are now grouped by their rendered
width — one `oxfmt` call per distinct width — so wrapping matches the stdin path
while still batching (nearly every block shares one width). The `<style>` cache
key now includes the width so the same body at two indentations can't collide.
