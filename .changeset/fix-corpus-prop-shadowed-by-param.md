---
"@rsvelte/compiler": patch
---

fix(compiler): resolve a prop shadowed by a same-named function parameter

When a legacy prop/store (`export let brush = writable(...)`, also read as
`$brush`) shares its name with a function parameter (`function setBrushContext(brush) {…}`),
Phase-2 can register that parameter at the instance scope index. Binding lookups
keyed on `instance_scope_index` then resolved to the parameter (kind `normal`)
instead of the prop, so the prop was mis-compiled:

- client store-getter emitted `$.store_get(brush, …)` instead of `$.store_get(brush(), …)`;
- the `$.prop(…)` flag dropped `PROPS_IS_BINDABLE`;
- the server emitted a plain `let brush = writable(...)` instead of
  `let brush = $.fallback($$props['brush'], () => writable(...))`.

Prefer an actual `prop`/`bindable_prop` binding of the name over a shadowing
local/parameter in the three resolution points (`binding_by_name`,
`calculate_prop_flags`, server `legacy_binding_is_prop`). Also emit
`$.bind_props({…})` in source-declaration order (`declaration_start`) since a
prop that is also a store subscription can otherwise be listed out of order.

Clears `layerchart/.../BrushContext.svelte` and `.../GeoContext.svelte`
(49 → 47).
