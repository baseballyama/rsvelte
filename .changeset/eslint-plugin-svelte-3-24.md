---
'@rsvelte/cli': patch
---

`rsvelte lint` follows `eslint-plugin-svelte` 3.24.1 and `svelte-eslint-parser` 1.10.1.

- `svelte/valid-compile` and `svelte/no-unused-svelte-ignore` compile a component with the `compilerOptions.runes` of its `svelte.config.js`, so they report the warnings of runes mode in a component that relies on that option.
- `svelte/no-unused-svelte-ignore` no longer reports a `svelte-ignore` comment for a runtime warning, such as `ownership_invalid_binding`, which the compiler never reports.
- `svelte/valid-compile` and `svelte/no-unused-svelte-ignore` read a `svelte-ignore` comment before a node inside a statement, such as an object property or a call argument, as Svelte 5 does. A comment at the end of the line before a node no longer ignores warnings of that node.
- `svelte/indent` accepts a comment before a closing bracket when the comment has the indentation of the line above it.
- `svelte/sort-attributes` no longer reports or moves a shorthand attribute or a directive across a spread attribute.
- `svelte/prefer-svelte-reactivity` no longer reports in a component that is not in runes mode.
- `svelte/prefer-const` and `no-unused-vars` read the `$bindable()` props of `$props() as T`, `$props()!` and `$props() satisfies T` as those of `$props()`.
