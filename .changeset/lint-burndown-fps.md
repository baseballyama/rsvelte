---
---

Internal: lint-corpus burndown (745 → 556 divergences vs eslint-plugin-svelte,
0 new at each step). Fixes the playground `'filter' is never reassigned` false
positive (`prefer-const` now sees writes inside `{@render}` arguments) and makes
`prefer-const` robust to components that fail full analysis (validation errors)
by falling back to a parse-only write scan covering bind/destructuring/redeclare
writes. Also: `max-attributes-per-line` reports the real shorthand attribute name
(`{x}` → `x`, was `''`), and `html-self-closing` now checks `<slot />`. No
published package is affected (`rsvelte_lint` is not released).
