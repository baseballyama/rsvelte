---
"@rsvelte/lint": patch
"@rsvelte/language-server": patch
---

feat(lint): track eslint-plugin-svelte 3.24.0. `svelte/prefer-svelte-reactivity` no longer reports in non-runes components; `svelte/sort-attributes` no longer reports or moves shorthand attributes and directives across a spread attribute; `svelte/require-each-key` ends its report at the opening tag's closing brace; `svelte/no-top-level-browser-globals` accepts the `$app/env` alias of `$app/environment`; `svelte/no-unused-svelte-ignore` skips ignores for runtime-only warnings, honours an ignore on a nested script node and no longer attributes a trailing comment to the next node; `svelte/require-store-reactive-access` checks `??=` / `||=` / `&&=` and only offers the `$` fix where Svelte accepts `$store`; `svelte/no-navigation-without-resolve` follows array / object literal elements (including spreads and `{#each}` destructuring) and only treats a complete `external` token in `rel` as external.
