---
"@rsvelte/compiler": patch
---

fix(compiler): faithful `$`-store auto-subscription classification for two edge cases

Two lexical-scope heuristics in the store-subscription detector diverged from
upstream's scope analysis:

- Destructured arrow parameters spanning multiple lines
  (`([\n  $a,\n  $b\n]) => …`, e.g. LayerCake's `derived` callbacks) were not
  recognized as local bindings because the param-detection whitespace scan
  stopped at the newline before the delimiter. Those names were wrongly emitted
  as store getters (`const $a = () => $.store_get(a(), …)`) and reordered the
  emitted getter block.
- A store reference in a ternary consequent behind a unary operator
  (`cond ? !$store : x`) was misclassified as an object property key, so no
  store getter was emitted at all.

Both now match the official compiler; the LayerCake and svelte-ux `AppLayout`
corpus entries compile byte-identically for CSR and SSR.
