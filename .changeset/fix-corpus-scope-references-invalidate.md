---
"@rsvelte/compiler": patch
---

fix(compiler): correct legacy `invalidate_inner_signals` for `<select bind:value>` indirect bindings

Legacy `<select bind:value={prop…}>` must invalidate the OTHER scope variables read
within the select (e.g. a `guid` prop in the select's `id=` attribute) whenever the
bound value is mutated. Several gaps are fixed so the invalidation matches upstream:

- **`legacy_indirect_bindings` population** (`2-analyze/RegularElement`): the indirect
  bindings are now collected from the select's enclosing scope **and its ancestors**
  (via `binding.scope_index`, not the backward-compat-polluted `scope.declarations`),
  so an outer-scope prop like `guid` is included while child-scope each-block items are
  excluded. Store auto-subscriptions (`$label`) are skipped (no real scope binding
  upstream).
- **assignment LHS is reactive** (`has_reactive_state` AssignmentExpression): `{(x.value
  = [])}` now reads `x` on the LHS, so the text is reactive (`$.template_effect`) rather
  than a static `nodeValue =`.
- **invalidate wrap on prop member mutations** (template assignment + component
  `bind:value` setter): a prop member mutation whose prop has `legacy_indirect_bindings`
  is wrapped in `(<mutation>, $.invalidate_inner_signals(() => { … }))`.

Clears `svelte-form-builder/.../PropertyPanelDataAttributes.svelte`, zero corpus
regressions (binding-indirect / binding-interop-derived / select-option-store etc. all
still pass).
