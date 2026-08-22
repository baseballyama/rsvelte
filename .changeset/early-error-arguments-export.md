---
'@rsvelte/compiler': patch
---

Reject the three remaining early errors acorn raises and rsvelte answered with the wrong error code: `arguments` in a class field initializer, `arguments` in a class static initialization block, and — in a `.svelte.(js|ts)` module — `export { x }` for a name that is not declared. All three compiled or reported a different code where official reports `js_parse_error`; the last one reported `export_undefined` with no position at all. The undefined-export check is deliberately module-only: upstream clears acorn's `undefinedExports` after every statement when it parses a component `<script>`, because the exported name may be declared elsewhere in the component, so `export { nope }` there still compiles
