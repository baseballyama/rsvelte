# `element-bind-member-mutation.svelte`

**Issue:** [#3935](https://github.com/baseballyama/rsvelte/pull/3935)

A regular element `bind:` setter whose target is a member of a legacy prop or mutable source. The synthesized assignment must retain the source AST's root binding after the getter transform changes `options.from` into `options().from`; otherwise the setter emits a bare member assignment instead of the prop/state `mutate` transform. A computed state member pins reactive index reads in the same path.
