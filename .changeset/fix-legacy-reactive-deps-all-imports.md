---
"@rsvelte/compiler": patch
---

fix(transform): include all imports in legacy `$:` dependency thunks regardless of scope

A legacy `$:` reactive statement compiles to `$.legacy_pre_effect(() => (deps…), …)`.
Upstream `LabeledStatement.js` adds a dependency for every referenced binding that
is not `kind === 'normal' && declaration_kind !== 'import'` — i.e. **all** imports
qualify, regardless of which scope they were declared in.

rsvelte built the import-membership list with a `scope_index == instance_scope`
filter. In some TypeScript components the first imports are assigned scope 0 while
later imports land in the instance scope, so a `$:` block calling an early-imported
helper (e.g. `createScale(...)`) dropped that helper from the deps thunk. The
filter now includes every `Import`-kind binding, matching upstream.

Fixes the corpus entry
`layerchart/packages/layerchart/src/lib/components/ChartContext.svelte`.
