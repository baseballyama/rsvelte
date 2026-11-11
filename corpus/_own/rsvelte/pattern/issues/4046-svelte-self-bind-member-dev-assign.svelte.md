# `4046-svelte-self-bind-member-dev-assign.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

`SvelteSelf` is absent from upstream's dev `$.assign` exemption list that `Component` and `SvelteComponent` are on, so the synthesized `bind:` setter keeps the wrap — but only where `build_assignment` reaches it, i.e. the root has a binding and no `mutate` transform. The five rows cross both answers: a non-source `$state`, a nested key and a computed key are wrapped; a state SOURCE and a `$derived` are not. Keying the decision on "is this a state source" instead answers every row backwards.
