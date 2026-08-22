---
"@rsvelte/compiler": patch
---

svelte2tsx: decide `$$props` / `$$restProps` / `$$slots` from code positions rather than from a raw byte scan of the whole `.svelte` source. Upstream sets these per AST identifier, so the bytes inside a string literal, a comment, markup text, a `<style>` body or the module script are not a use — `const docs = ['$.prop($$props, "x")']` no longer fabricates a `let $$props = __sveltets_2_allPropsType()` declaration. The cheap scan is kept as the necessary-condition pre-filter and every positive it reports is now confirmed against code bytes.
