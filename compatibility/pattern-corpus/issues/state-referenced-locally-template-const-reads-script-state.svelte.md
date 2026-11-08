# `state-referenced-locally-template-const-reads-script-state.svelte`

**Issue:** [#4890](https://github.com/baseballyama/rsvelte/issues/4890)

A declaration tag's initializer is walked by `walk_js_expression_node`, not the Identifier visitor, so `declaration_tag.rs` raises its share of `state_referenced_locally` itself. It used to warn for every `$state` / `$derived` binding of the instance script read anywhere in the initializer. Upstream visits the declaration with `function_depth` set to the fragment scope's, and warns only for a binding at that depth whose kind qualifies (a `$state` only when reassigned or when its argument would not be proxied). It also skips closures and `$derived` / `$inspect` arguments, which are one level deeper, and names a read nested inside a `$state(…)` argument `derived`. The rows cover:
- script state and props read in a `<div>`'s `{const}` (no warning)
- a primitive local `$state` read in the same tag (warning)
- a proxied local `$state` (no warning)
- a read that is the `$state` argument (`closure`) and one nested inside it (`derived`)
- `$derived` arguments, object keys and member properties (no warning)
- a read in a later tag of the same scope (warning) and one in a nested block (no warning)
