# `3315-parenthesised-rune-statements.svelte`

**Issue:** [#3315](https://github.com/baseballyama/rsvelte/issues/3315)

The same parentheses around a rune in **statement** position (`$inspect`, `$effect`) and in a `return`. These are removed rather than lowered, so the defect surfaces as `( );` left where the call was — a different failure from the declaration file's, on the same axis
