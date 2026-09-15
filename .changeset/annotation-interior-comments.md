---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(parse): a comment inside a TypeScript annotation reaches the public AST

An annotation, its type arguments, its type parameters and a return type are serialized from an
opaque value, so their nested nodes never consulted the comment side table. `type T = { /** doc */
b: string }` kept the comment and every other context dropped it — a plain or destructured
declarator, `$props()`, a function parameter, an `as` cast and a type argument. The parse-AST
parity ratchet falls from 163 to 149 keys.
