---
'@rsvelte/compiler': patch
---

Parse a template expression with the component's one language mode. Upstream picks the acorn variant once per component from `parser.ts` — set when any script declares `lang="ts"` — while rsvelte retried the *other* mode on failure, so TypeScript-only syntax (`as`, `satisfies`, `!`, `<T>x`, `f<T>()`, annotated arrow parameters) compiled in a component with no `lang="ts"` anywhere; a `{#snippet}` generic clause is likewise consumed only in TypeScript mode. A failure is also classified the way upstream classifies it: leftover input is `expected_token` only when what precedes it is itself a complete expression, so an error *inside* a nested expression (`{@html String(a b)}`) is `js_parse_error`, and an attribute value gets that classification too
