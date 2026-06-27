---
"@rsvelte/compiler": patch
---

fix(transform): switch-case dep order, SSR control-flow store reads, bind getter/setter setter reads

- `collect_reactive_statement_dependencies` visits a `SwitchCase`'s `consequent`
  before its `test` (acorn populates them in that order), so a `$:` switch's
  dependency-thunk order matches the official compiler.
- The SSR instance-script catch-all statement arm now read-wraps store/derived
  reads (`if ($store === …) …`, `for`/`while`/blocks), matching upstream's
  visit-every-statement behavior (the ExpressionStatement / FunctionDeclaration
  arms already did).
- A `bind:value={getter, setter}` setter body now has read transforms applied,
  so reactive reads inside the setter (`(v) => { … control.min … }`) become
  `$.get(...)`.
