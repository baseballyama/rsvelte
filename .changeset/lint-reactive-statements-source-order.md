---
'@rsvelte/cli': patch
---

`svelte/infinite-reactive-loop` and `svelte/no-immutable-reactive-statements` now read the `$:` statements of a component in source order, as ESLint does. When a `<script module>` with a `$:` statement came after the instance `<script>`, the first rule missed reports and the second reported statements that are reactive.
