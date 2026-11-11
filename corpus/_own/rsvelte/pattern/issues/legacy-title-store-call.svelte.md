# `legacy-title-store-call.svelte`

**Issue:** [#4024](https://github.com/baseballyama/rsvelte/pull/4024)

A store auto-subscription called inside a mixed `<title>` expression must lower to the subscribed function value before invocation. The title memoizer previously preserved `$translate(...)` as a global call instead of emitting `$translate()('page.title')`.
