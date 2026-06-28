---
"@rsvelte/compiler": patch
---

fix(compiler): order `$.bind_props` props correctly when a prop is shadowed by a function parameter

When an `export let` prop shares its name with a function parameter elsewhere in
the script —

```svelte
<script>
  function setTooltipContext(tooltip) { setContext(key, tooltip); }
  export let tooltip = writable({ … });   // line 116
  export let hideDelay = 0;               // line 127
</script>
```

— the `BindableProp` kind can land on the parameter binding (which has no
`declaration_start`), so the server `$.bind_props($$props, { … })` trailer sorted
that prop to the end (`{ …, hideDelay, tooltip }`) instead of its true source
position (`{ …, tooltip, hideDelay }`).

Fix the bind_props sort to borrow the real `let`/`var` declaration's
`declaration_start` when the marked binding lacks one. This is sort-only: it does
not change which binding is marked `BindableProp`, so the var-hoisting order (and
the previously-fixed `BrushContext`/`GeoContext` outputs) are untouched. Clears
`layerchart/.../tooltip/TooltipContext.svelte` (44 → 43).
