# `3126-escaped-selector-prune.svelte`

**Issue:** [#3126](https://github.com/baseballyama/rsvelte/issues/3126)

`structural_simple_selector_is_evaluable` bailed on any class, id or type name containing a `\`, so a rule whose subject is an escaped selector was never tested against the tree and stayed as used. The file carries both directions — one escaped subject with no element child (prunes) and one with (keeps) — because a bail that always answers "used" is indistinguishable from a correct answer on the second alone
