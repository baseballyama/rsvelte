---
'@rsvelte/compiler': patch
---

parse: a template expression is TypeScript only when a script declares `lang="ts"`

Template expressions were parsed as TypeScript whatever the component declared,
so `{y as string}` compiled in a component with no `lang="ts"` where the official
compiler raises `expected_token`. The mode is now threaded through every helper
that decides it, including `check_js_parse_error_with_pos` — which is not a
parser but the oracle that decides whether a failed parse is an error at all, and
answered "valid" for TypeScript-only syntax.

`{@const}`, `{@render}` and the `{#await}` head additionally replaced a parse
failure with a placeholder identifier; upstream reads all three with
`read_expression`, which throws. Every template-expression entry point now
classifies a failure through one shared rule.
