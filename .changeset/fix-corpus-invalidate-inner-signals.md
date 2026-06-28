---
"@rsvelte/compiler": patch
---

fix(compiler): emit `$.invalidate_inner_signals` for legacy prop member mutations

A legacy `<select bind:value={prop.x}>` whose subtree references other variables
(`<option>` content, the select's own `id`, etc.) records those on the bound
prop's `legacy_indirect_bindings`; the official compiler wraps every mutation of
that prop in `(prop(...), $.invalidate_inner_signals(() => { …reads }))` so the
referenced signals re-read. rsvelte only did this for `bind:` setters, not for
ordinary prop member mutations (e.g. `field.tooltipAttributes = {}` in `onMount`).

Two fixes:
- Phase 3: the legacy prop-member-mutation rewrite (`prop_member_mutate_ast`) now
  wraps the mutation in the `$.invalidate_inner_signals` sequence when the prop
  carries indirect bindings, using each binding's read form (prop → `name()`,
  store sub → `name()`, reactive state/derived → `$.get(name)`, else bare).
- Phase 2: `legacy_indirect_bindings` collection is narrowed to identifiers
  referenced *within the `<select>` element's own source span* (ordered by source
  position), mirroring the official `scope.references` iteration. Previously it
  pulled in every template-referenced binding in the component, so an `id` used on
  an unrelated sibling element leaked into the invalidation list.

Clears `svelte-form-builder/.../PropertyPanelTooltip.svelte` (50 → 49).
