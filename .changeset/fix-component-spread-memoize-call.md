---
"@rsvelte/compiler": patch
---

fix(transform): memoize a component spread whose expression is a call

Upstream's component transform runs every `{...expr}` spread through the
memoizer, so a spread whose value is a (non-pure) call — `<Group {...getGroupProps()}>`
— is hoisted into `let $0 = $.derived(getGroupProps)` and passed as
`$.spread_props(() => $.get($0), …)`, even when it reads no reactive state
directly. rsvelte only consulted the memoizer when the expression itself had
reactive state (`has_state`), so a call-valued spread was inlined eagerly
(`$.spread_props(getGroupProps(), …)`), losing reactivity. `process_spread_attribute`
now always calls the memoizer and thunks on `is_memoized || has_state || has_await`,
matching the official compiler. Clears layerchart ArcChart.base.svelte and
PieChart.base.svelte.
