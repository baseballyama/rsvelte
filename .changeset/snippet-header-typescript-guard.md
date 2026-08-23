---
"@rsvelte/compiler": patch
---

Gate a `{#snippet}` header's type parameter scan on the component being in TypeScript mode, and require the `(` that opens the parameter list outside loose mode — both are upstream's rules (`parser.ts && parser.match('<')` and `eat('(', true, false)`). Without them `{#snippet s<T>(a)}` compiled in a component with no `lang="ts"`, and `{#snippet s}` compiled anywhere, where the official compiler raises `expected_token`. An unterminated type parameter list now reports `unexpected_eof` at the end of the input, as `match_bracket` does.
