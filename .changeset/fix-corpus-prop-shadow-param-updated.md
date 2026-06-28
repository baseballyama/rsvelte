---
"@rsvelte/compiler": patch
---

fix(compiler): keep `PROPS_IS_UPDATED` when a reassigned prop is shadowed by a function parameter

When an `export let` prop shares its name with a function parameter elsewhere in
the component, the `BindableProp` kind can land on the parameter binding (which is
never reassigned), while the real prop declaration — which actually carries the
reassignment — ends up as a separate instance-scope binding:

```svelte
<script context="module">
  function setCanvasContext(context) { setContext(key, context); } // param `context`
</script>
<script>
  export let context = undefined;                 // the real prop
  onMount(() => { context = element?.getContext('2d'); }); // reassigns the prop
</script>
```

`calculate_prop_flags` resolved the parameter binding (not reassigned) and emitted
`$.prop($$props, "context", 8, …)` (BINDABLE) instead of the correct `12`
(BINDABLE | UPDATED).

When computing `PROPS_IS_UPDATED`, also OR in the reassigned/mutated state of any
same-named *real* declaration in the instance/module scope (excluding function
parameters). This is flag-only — it does not change which binding is marked
`BindableProp`, so var-hoisting (and the previously-fixed `BrushContext` /
`GeoContext` outputs) are untouched. Clears
`layerchart/.../layout/Canvas.svelte` (41 → 40).
