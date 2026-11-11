# `3123-let-directive-pattern-defaults.svelte`

**Issue:** [#3123](https://github.com/baseballyama/rsvelte/issues/3123)

A default inside a `let:` pattern parses as an assignment, and neither target reinterpreted it: SSR collapsed it to the directive name (`[undefined, ...tail]` — the body's `head` is then unbound), and the client dropped the whole `$.derived` when the pattern bound no names. `<svelte:fragment>` had a second, cruder copy of the client logic that rebuilt the pattern from the property **keys**, so a rename, a nested pattern, a rest and a computed key were all wrong there and only there
