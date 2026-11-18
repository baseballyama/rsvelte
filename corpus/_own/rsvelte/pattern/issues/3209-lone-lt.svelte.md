# `3209-lone-lt.svelte`

**Issue:** [#3209](https://github.com/baseballyama/rsvelte/issues/3209)

A lone `<` as the last thing in the template. Upstream reads the tag name off a RIGHT-TRIMMED template, so the trailing newline does not make it text — rsvelte treated the empty name as 'not a tag' and emitted the `<` as text
