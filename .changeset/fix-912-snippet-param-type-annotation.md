---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): preserve explicit type annotations on destructured `{#snippet}` parameters (#912). A snippet parameter that destructures and annotates its type (`{#snippet menuitem({ contentId }: { contentId?: string })}`) had its annotation dropped: the lowering spanned only the `{ contentId }` pattern, so svelte2tsx synthesized `{ contentId: any }` — losing both the type and the `?` optionality, and `{@render menuitem({})}` wrongly errored as a missing required property. The parser now folds a destructuring parameter's `typeAnnotation` into its span (mirroring the already-correct identifier-parameter path), so the generated `Snippet<[T]>` parameter type uses the annotation verbatim.
