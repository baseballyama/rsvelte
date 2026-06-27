---
"@rsvelte/compiler": patch
---

fix(transform/server): two SSR codegen fixes for `.svelte.(js|ts)` modules + known strings

- `$effect.tracking()` in a `.svelte.(js|ts)` module is now lowered to the literal
  `false` on the server (there is no effect tracking during SSR), matching the
  instance-script path and the upstream server CallExpression visitor.
- A binding initialized to a template literal (`const w = \`…${x}…\``) is treated
  as a defined string by the server evaluator, so reads of it are no longer wrapped
  in an unnecessary `$.stringify(...)`.
