---
"@rsvelte/oxlint-plugin": patch
---

fix(oxlint-plugin): report markup diagnostics once for dual-script components in multi-file runs

A `.svelte` component with both a `<script module>` and a `<script>` block is
visited by oxlint once per block. The plugin's per-rule de-dup tracked "the
last file seen" in a closure shared across the whole oxlint invocation
(`createOnce` runs its visitor once for the entire run, not per file), so an
interleaved visit to a different file between the two blocks reset the de-dup
state and caused markup diagnostics (e.g. `svelte(require-each-key)`,
`svelte(no-at-html-tags)`) to be reported twice when linting multiple files in
one `oxlint` invocation. De-dup state is now keyed by the file's exact source
content instead of by visit order, so it survives any interleaving.
