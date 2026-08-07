---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

svelte2tsx now honours `namespace: 'foreign'`. Official svelte2tsx derives
`preserveAttributeCase` from it (`htmlxtojsx_v2/index.ts`) and skips the
attribute-name case fold, so `<element someAttr="hi">` projects as
`"someAttr"`. rsvelte had no `foreign` namespace at all: the value was
unreachable from the napi and wasm boundaries (it fell into the `_ =>
Svelte2TsxNamespace::Html` arm), `MarkupNamespace` had no matching variant,
and `Svelte2TsxOptions::namespace` was never read by the projection — so even
a caller constructing the option directly got attribute names folded to lower
case with no diagnostic. This affects users whose `svelte.config.js` sets
`compilerOptions.namespace = 'foreign'`, which the language server passes
straight through.
