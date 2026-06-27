---
"@rsvelte/compiler": patch
---

fix(transform): `$.mutate` wrap for a state member mutation in an if-guarded `$:`

A `$: if (cond) obj.a.b = x` (state-var member mutation inside an if-guarded
reactive statement) was emitted without the `$.mutate(obj, …)` wrap — the
keyword-LHS branch was missing the state-member-mutation pass that both sibling
branches run.
