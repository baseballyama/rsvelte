---
"@rsvelte/compiler": patch
---

fix(compiler): a prop default referencing a legacy `$:` reactive variable is lazy

```svelte
<script>
  $: defaultServiceUrl = services['mapbox v1']['streets-v11'];
  export let serviceUrl = defaultServiceUrl;
</script>
```

`serviceUrl`'s default references `defaultServiceUrl`, a legacy `$:` reactive
variable (`BindingKind::LegacyReactive`). Upstream applies the read transform
first — `defaultServiceUrl` → `$.get(defaultServiceUrl)` — so `is_simple_expression`
sees a (non-simple) `CallExpression` and emits a lazy thunk with
`PROPS_IS_LAZY_INITIAL`: `$.prop($$props, 'serviceUrl', 28, () => $.get(defaultServiceUrl))`.

rsvelte's prop-flag reactivity check only recognised
`bindable_prop`/`prop`/`state`/`raw_state`/`derived` identifiers as non-simple, so
a `LegacyReactive` reference was treated as simple → emitted eagerly
(`…, 12, $.get(defaultServiceUrl)`). Add `LegacyReactive` to both prop-default
paths; unlike a prop ref it transforms to a member call (`$.get(...)`), so it is
thunked rather than unwrapped to a bare callee.

Clears `layerchart/.../docs/TilesetField.svelte`, zero corpus regressions.
