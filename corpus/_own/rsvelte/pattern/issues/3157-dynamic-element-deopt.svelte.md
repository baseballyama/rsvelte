# `3157-dynamic-element-deopt.svelte`

**Issue:** [#3157](https://github.com/baseballyama/rsvelte/issues/3157)

One `<svelte:element>` used to switch off the compound, descendant-chain and nested-ancestor prunes for the whole component, so all three shapes are here rather than only the compound the issue was filed against. Each shape appears twice — once prunable, once matching — because a deopt and a correct keep produce the same text for the matching half alone
