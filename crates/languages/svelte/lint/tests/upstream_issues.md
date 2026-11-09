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
