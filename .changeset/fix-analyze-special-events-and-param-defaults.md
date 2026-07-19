---
"@rsvelte/compiler": patch
---

fix(analyzer): visit special events and parameter defaults

Two analyzer gaps left references unrecorded, which could feed incorrect
warnings/eliminations downstream:

- **`on:` directives on `<svelte:window>` / `<svelte:document>` / `<svelte:body>`**
  were parsed but never walked, so an expression like
  `<svelte:window on:keydown={handle_keydown} />` never recorded a reference to
  `handle_keydown`. These special elements now route their `on:` directives
  through the same `on_directive` visitor regular elements use, matching the
  official compiler's generic `context.next()` walk in `SvelteWindow.js` /
  `SvelteDocument.js` / `SvelteBody.js`.
- **Function/arrow parameter patterns** (`function f(a, {b} = c, [...d]) {}`)
  were never visited at all, so identifiers referenced only in a default value
  — e.g. a store subscription in `function goto_page(page = $search_params.page) {}`
  — were invisible to the analyzer. `FunctionDeclaration` / `FunctionExpression`
  / `ArrowFunctionExpression` now walk `params` through the existing generic
  typed walker (`walk_js_node_typed`) before the body, mirroring upstream's
  `context.next()` over the whole function node. This also restores the
  self-reference every other declaration site already gets (see
  `variable_declarator.rs`), which `export_let_unused`'s "more than one
  reference" heuristic depends on for other binding kinds.
