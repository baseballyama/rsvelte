---
"@rsvelte/compiler": patch
---

fix(parse): preserve the remaining TypeScript assertion forms in parse() output

Follow-up to #1648, which deliberately deferred three forms. `parse()` now also
keeps `TSTypeAssertion` (`<T>x`) and `TSInstantiationExpression` (`f<T>`) — with
svelte/compiler-compatible shape (`TSTypeAssertion` serializes `typeAnnotation`
before `expression`; `TSInstantiationExpression` carries `typeArguments`) — and a
non-null `!` sitting inside an optional chain (`a!?.b`), matching svelte/compiler.
As with the other wrappers, `remove_typescript_nodes` erases them before
analyze/transform, so compiled client/server output is unchanged.
