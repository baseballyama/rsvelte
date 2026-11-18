# `await-destructure-dollar-shadow.svelte`

**Issue:** [#3954](https://github.com/baseballyama/rsvelte/pull/3954)

Dollar-prefixed names introduced by await, each and snippet patterns resolve in their template scope instead of becoming synthetic store subscriptions.
