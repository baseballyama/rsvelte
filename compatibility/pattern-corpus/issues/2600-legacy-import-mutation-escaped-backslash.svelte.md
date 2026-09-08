# `2600-legacy-import-mutation-escaped-backslash.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

A mutated import in legacy mode. `find_matching_close_paren` never found the `)` of the first `$.mutate(obj, …)`, and because the rewrite loop `break`s rather than advancing, **every later mutation of the same import** was skipped too — the blast radius is larger than the statement that contains the string
