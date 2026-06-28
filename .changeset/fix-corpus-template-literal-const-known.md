---
"@rsvelte/compiler": patch
---

fix(compiler): treat a const template-literal of known parts as non-reactive

A component object-prop that references a `const` whose initializer is an
interpolated template literal made of known constants —

```svelte
<script>
  const default_title = "Svelte UI Components";
  const image = `https://example.com/og?title=${default_title}`;
</script>
<MetaTags openGraph={{ images: [{ url: image }] }} />
```

— was over-memoized: `image` was treated as reactive state (so `openGraph` was
wrapped in `$.derived(() => ({ … }))` instead of inlined), because Phase-2 only
recorded a binding's `initial` for plain literals — an interpolated template
literal left it `None`, which the reactive-state check reads as "unknown →
reactive".

Record the template-literal initializer AST in a new `Binding.init_expr_json`
field (kept separate from `initial`, which feeds `is_prop_source`), populated in
both the typed and JSON variable-declarator paths. The reactive-state check then
runs `is_expression_known_json` over it (depth-guarded) — approximating
`scope.evaluate().is_known` — so a template whose interpolations are all known
constants is non-reactive, while one containing a call / await / reactive read
stays reactive (still memoized). Clears `flowbite-svelte/src/routes/+page.svelte`
and `.../blocks/+page.svelte` (47 → 45).
