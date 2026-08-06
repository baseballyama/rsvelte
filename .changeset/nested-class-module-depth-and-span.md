---
"@rsvelte/compiler": patch
---

Stop over-warning `perf_avoid_nested_class` in a standalone `.svelte.(js|ts)` module, and give the warning a position

Upstream's `analyze_module` passes no `ast_type` at all, so `allowed_depth` is `1` for a standalone module and only a component's `<script module>` gets `0`. rsvelte treated both as `'module'`, so `describe(() => { class A {} })` in a `.svelte.js` warned one function level early. The warning also carried no span, leaving an editor nowhere to put the squiggle; it now reports the `ClassDeclaration` position.
