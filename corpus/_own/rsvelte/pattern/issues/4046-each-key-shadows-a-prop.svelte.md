# `4046-each-key-shadows-a-prop.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A keyed `{#each}` whose item name shadows a prop of the same name. The key function's parameter is that item, so upstream emits `(page) => page.key`; rsvelte applied the prop read to the MEMBER OBJECT without consulting `shadowed_prop_names` — the check both the identifier arm and the rest-prop branch beside it already make — and emitted `(page) => page().key`. The non-shadowing item, the array-wrapped key and the identity key are the controls: only the member form ever moved.
