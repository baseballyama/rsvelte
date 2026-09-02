---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

A component with a module script now emits two store-subscription ignore regions at the
render-function start rather than one.

Upstream builds a second `ImplicitStoreValues` for the module script, seeded with the
instance script's accessed stores but with its own import list, and each instance wraps its
own names in one `/*Ωignore_startΩ*/ … /*Ωignore_endΩ*/` region. rsvelte collected both
scripts' imports into one list, which also dropped a name imported by both scripts — upstream
declares it in each region — and would have emitted the module's region first when the module
script is written second.
