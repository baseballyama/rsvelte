# `store-sub-computed-component-bind.svelte`

**Issue:** [#4030](https://github.com/baseballyama/rsvelte/pull/4030)

A component `bind:` setter with both a store-backed object and a store-backed computed key must read-transform both subscriptions before assigning the selected member.
