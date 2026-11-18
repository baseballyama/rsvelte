# `2598-escaped-backslash-reactive-statement.svelte`

**Issue:** [#2598](https://github.com/baseballyama/rsvelte/pull/2598)

The same scanner defect with a `$:` statement after the string instead of an `export`: the label survives into the component body as a labelled statement, which **parses**. No parse-level gate can see this half — only output equality can, which is why it is pinned here separately
