---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

Give a `bind:` / `class:` shorthand's synthesized `Identifier` no `loc`, as upstream's does, and stop stripping the `loc` off an explicit one. Upstream builds that node by hand in `1-parse/state/element.js` and simply writes no `loc`; rsvelte attached one in the parser and then removed it again wherever `expression.name === directive.name`, which is a different predicate — it also fires on `bind:map={map}`, whose expression *was* parsed and *does* carry a position. The strip lived only in the legacy converter, so the two AST modes were wrong in different places: `legacy` dropped a real expression's `loc` while `modern` kept a synthesized one on both shorthands. `parse()` is the only affected output; `compile()` is byte-identical on all four targets across the corpus.
