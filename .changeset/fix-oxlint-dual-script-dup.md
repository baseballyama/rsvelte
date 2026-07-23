---
"@rsvelte/oxlint-plugin": patch
---

fix(oxlint-plugin): report each diagnostic exactly once for dual-script components in multi-file runs

A `.svelte` component with both a `<script module>` and a `<script>` block is
visited by oxlint once per block. The plugin's per-rule de-dup tracked "the
last file seen" in a closure shared across the whole oxlint invocation
(`createOnce` runs its visitor once for the entire run, not per file), so an
interleaved visit to a different file between the two blocks reset the de-dup
state and caused markup diagnostics (e.g. `svelte(require-each-key)`,
`svelte(no-at-html-tags)`) to be reported twice when linting multiple files in
one `oxlint` invocation.

De-dup state is now keyed by filename, in a cache separate from the
expensive-lint result cache (which stays keyed by file content, to still
share one lint run across a file's ~160 rule visitors). An earlier version of
this fix keyed de-dup state off that content-keyed cache directly, which
introduced a worse regression: two distinct files with byte-identical content
would share the same "already reported" state, and the second file's
diagnostics would silently disappear instead of duplicating. Keeping the two
caches independent also means the content cache's eviction can no longer
resurrect the original duplicate-report bug, since de-dup state no longer
lives on the evicted object.
