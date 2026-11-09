---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Stop reporting `state_referenced_locally` for a template `{const}` / `{let}` that reads `$state`, `$derived` or props from the component's `<script>`, as the official compiler does. The warning now fires, with the same `closure` / `derived` wording, only for a declaration-tag binding of the same block read synchronously, after its declaration.

`$state(K)`, where `K` is a binding holding a primitive (`const K = 5`, or a prop whose fallback is one), now warns in both `<script>` and declaration tags, as upstream's `should_proxy` resolves the identifier. Defaults and computed keys in a declaration tag's destructuring pattern count as reads; class keys do not.
