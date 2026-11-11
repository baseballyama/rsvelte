# `3075-nested-snippet-hoist.svelte`

**Issue:** [#3075](https://github.com/baseballyama/rsvelte/issues/3075)

A root-level snippet that declares a nested snippet was never hoisted to module scope: rendering the nested one read as an instance-level reference, though its binding sits in the same fragment. The file carries both directions — a hoistable snippet with a nested one, and a snippet whose nested body reads `$state`, which must stay pinned, because seeding the nested name without descending into its body turns the fix into an over-hoist. The hoistable snippet puts markup **before** the nested one, which is [#3076](https://github.com/baseballyama/rsvelte/issues/3076)'s svelte2tsx ordering shape
