---
"@rsvelte/compiler": patch
---

Reject `{@const}` placed directly inside `<svelte:self>`, as the official compiler does. Upstream's placement rule names `Component` and `SvelteComponent` among the legal parents and stops there; rsvelte folded all three component-like nodes into one fragment-owner value, and `<svelte:self>` did not push one at all, so the tag was judged against whatever enclosed the element instead. It now has its own owner, kept equivalent to a component everywhere the two really do agree.
