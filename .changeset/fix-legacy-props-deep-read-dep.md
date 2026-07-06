---
"@rsvelte/compiler": patch
---

fix(analyze): record `$$props` references so legacy reactive deps deep-read it

A legacy reactive expression reading `$$props.x` (e.g. an `{#if $$props.class || underline || cursor}` test) omitted the `$.deep_read_state($$sanitized_props)` dependency from its `build_expression` sequence, so it read `($.deep_read_state(underline()), …)` instead of `($.deep_read_state($$sanitized_props), $.deep_read_state(underline()), …)`.

The cause was that Phase 2 never declared a `$$props` binding, so `$$props.x` resolved to nothing and no reference was recorded in the expression metadata. Mirror upstream `2-analyze/index.js`, which declares a synthetic `$$props` `rest_prop` binding in the instance scope (non-runes branch) before the walks. The Phase-3 `build_expression` port already deep-reads a `$$props` reference (mapping it to `$$sanitized_props`); it simply never saw one.

Guard `has_prop_bindings` against the synthetic name so a component with no real props (e.g. a static SVG icon) does not gain a spurious `$$props` parameter — mirroring upstream's `binding.node.name !== '$$props'` checks. `$$restProps` is deliberately left undeclared (its plain-read path already works and binding it would mis-route `$$restProps.x`). Removes `svelte-ux/packages/svelte-ux/src/lib/components/Tooltip.svelte` from known-failures.client.json.
