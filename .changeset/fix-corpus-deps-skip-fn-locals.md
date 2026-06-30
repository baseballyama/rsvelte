---
"@rsvelte/compiler": patch
---

fix(compiler): don't collect a nested function's local declarations as reactive dependencies

A legacy reactive expression whose value contains a nested function with its own
local declarations —

```svelte
sum(visibleSeries, (s) => {
  const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data;
  return valueAccessor(seriesTooltipData);
})
```

— wrongly listed the function-local `seriesTooltipData` in the dependency
sequence (`$.deep_read_state(seriesTooltipData)`). Upstream filters references by
`function_depth`: a binding declared inside the nested function is a local, never
an eager dependency (its own deps — `findRelatedData`/`data`/`x` — are tracked
instead).

The fallback dependency collector (`collect_reactive_references_inner`) already
shadowed arrow/function *parameters*; it now also shadows top-level
`const`/`let`/`var` declarations in the function body (scoped via the existing
seen-set save/restore).

Clears `layerchart/.../charts/BarChart.svelte`, zero corpus regressions.
