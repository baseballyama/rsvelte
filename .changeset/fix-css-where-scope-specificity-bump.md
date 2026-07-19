---
"@rsvelte/compiler": patch
---

fix(transform): align CSS scope-class specificity bumping with the official compiler

The scoping-class placement inside `:is()` / `:where()` / `:has()` / `:not()`
now follows upstream `css/index.js`'s single `specificity.bumped` rule instead
of ad-hoc heuristics. Three cases were wrong:

- A standalone `:where(.foo)` (or `:is(.foo)`) at the top of a rule scoped its
  inner selector with a redundant `:where()` wrapper —
  `:where(.foo:where(.svelte-x))` instead of `:where(.foo.svelte-x)` — because
  the first scoping point must use the direct class, not `:where()`.
- A combinator by itself forced a specificity bump, so `:where(.a) > :where(.b)`
  produced `:where(.b:where(.svelte-x))` when the preceding relative selector
  emitted no modifier. The bump now comes solely from actual modifier
  application, matching upstream.
- A pseudo-class arg in a compound that IS scoped elsewhere
  (`nav:has(a).primary`, `:root:has(h1)`) must see the compound as already
  bumped, so its inner selector is `:where(.svelte-x)` — upstream bumps the whole
  compound before recursing into its pseudo args, even when no textual modifier
  is emitted (`:root` is exempt yet still bumps).

Fixes real-world `<style>` blocks that wrap top-level rules in `:where(...)`
(e.g. layerchart tooltip / layer / legend components).
