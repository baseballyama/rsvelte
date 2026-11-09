# Upstream issues

Bugs in eslint-plugin-svelte that this crate does not reproduce. Each is a candidate issue.

## svelte/prefer-const: a `<script module>` export is treated as a prop

- Case: `tests/cases/prefer-const/invalid/script-module-input.svelte`,
  `<script module>\n\texport let m = 1;\n</script>`.
- Upstream reports nothing. svelte-eslint-parser's `analyzePropsScope` adds a write to every
  `export let` in a script whose `context` attribute is not `"module"`, and Svelte 5's `module`
  attribute does not count.
- Correct: report `m`, as for `<script context="module">`. A module script's exports are not
  props, so nothing writes `m` after its declaration.

## svelte/prefer-svelte-reactivity: a reassigned variable hides its later constructions

- Case: `tests/cases/prefer-svelte-reactivity/invalid/reassigned-input.svelte.js`,
  `let q = new Set(); q = new Set(); q.add(1);`.
- Upstream reports only the first `new Set()`. The mutation check takes one result of
  `ReferenceTracker.iteratePropertyReferences` with `.next()` and never closes the generator,
  so `q` stays on the tracker's `variableStack` and the second construction is skipped as a cycle.
- Correct: report the second `Set` too. It is the one `q.add(1)` mutates, so upstream misses
  exactly the construction the rule exists to catch. rsvelte follows every reference of `q`
  from each construction and reports both.
