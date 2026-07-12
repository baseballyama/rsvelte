---
"@rsvelte/compiler": patch
---

fix(transform): a function-valued `$derived`/`$state` is reactive (not "known")

`is_expression_known_json` (rsvelte's port of upstream `scope.evaluate().is_known`)
treated an `ArrowFunctionExpression` / `FunctionExpression` as a known value, so a
function-valued rune such as `const projection = $derived(() => { … })` was
classed non-reactive and its reads were inlined instead of memoized
(`geo={{ projection }}` emitted a plain `{ projection: $.get(projection) }` rather
than a `$.derived(...)` + `get geo()`). Upstream's `evaluate` reports a function as
a `FUNCTION` symbol — NOT known (`is_known` requires a single concrete value) — so
the binding stays reactive. Function *bindings* (`const f = () => {}`) are still
handled earlier via `binding.is_function()`, so plain-function references are
unaffected. Clears layerchart GeoProjection/satellite.svelte and
GeoRaster/tiles-globe.svelte.
