---
'@rsvelte/compiler': patch
---

Accept a `bigint` key in a `$props()` destructure, and key the prop by its value

`let { 2n: a } = $props()` was rejected with `props_invalid_pattern` — "`$props()` assignment
must not contain nested properties or computed keys", which names neither. `LiteralValue::BigInt`
fell into the `_ => None` arm of the alias match and the `ok_or_else` turned "a key spelling this
port does not model" into "the user wrote an invalid pattern". Official compiles it on all three
targets, so this was an over-rejection: nothing downstream — svelte2tsx, the language server,
`rsvelte-lint` — could process the file either.

Upstream keys the prop by `String(key.value)`, so a bigint key carries its **value** and never
its spelling: `0x10n` declares the prop `16`, and `9007199254740993n` keeps all its digits
(the value is taken from the parsed literal, not through an `f64`). The client read path,
`$.prop(...)` key and `$.rest_props` exclusion now all use the decimal digits; the server keeps
the destructuring pattern verbatim, which is what upstream emits there too.
