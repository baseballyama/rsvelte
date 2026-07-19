---
"@rsvelte/compiler": patch
---

fix(svelte2tsx): a type-annotated `$props()`/`$state()`/`$derived()` self-named rune is not a store subscription

Upstream's `is_rune` check excludes a `$props()`/`$state()`/`$derived()` call
from store resolution when the declaration's binding NAME includes the rune
base (`parent.parent.name.getText().includes(base)`), using the binding node
only — never the type annotation. rsvelte's store-subscription pass relied on
a text scan that walked backwards over the whole `let … = ` region, so a
generic type annotation broke it:

```ts
// let { …, ...props }: ChartChildrenBaseProps<TData, XScale, YScale> = $props();
//                                             ^^^^^^ generic-arg commas
```

The backward scan stopped at the first `<…, …>` comma, never saw the `props`
binding, and so emitted a spurious `let $props = __sveltets_2_store_get(props)`
(wrapped in `Ωignore` markers) — diverging from the official svelte2tsx TSX
(layerchart Chart/ChartChildren `.base`/`.canvas`/`.html`/`.svg`/`.svelte`,
ChartCore). The store-injection pass now applies the exclusion on the AST via
the existing `excluded_rune_init` helper (binding-name only, like upstream),
dropping the self-named rune base before emitting subscriptions.
