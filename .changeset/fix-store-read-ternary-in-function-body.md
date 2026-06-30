---
"@rsvelte/compiler": patch
---

fix(transform): wrap store reads in a ternary inside a function body

The legacy text-based store-subscription read transform skipped any `$store`
whose following `:` made it look like an object property key (`{ $store: … }`).
Its object-literal guard only counted unmatched `{` in the emitted prefix, so a
function body's own block brace counted as an object literal — making a ternary
`cond ? $store : x` *inside any function body* match the property-key heuristic
and leave `$store` un-called.

A real property key is always immediately preceded (skipping whitespace) by `{`
(first entry) or `,` (later entry), whereas a ternary consequent is preceded by
`?`. The property-key check now also requires that preceding separator, so the
ternary `$store` is correctly lowered to `$store()`.

Fixes the corpus entry
`svelte-ux/packages/svelte-ux/src/lib/components/Duration.svelte`.
