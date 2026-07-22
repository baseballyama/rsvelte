---
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(napi): accept lenient compiler options like the official compiler

The N-API `compile`/`compileModule` surface now decodes every option the way
`svelte/compiler`'s `validate-options.js` does, instead of failing the whole
call with a raw N-API conversion error (`Failed to convert napi value into rust
type \`bool\``, `Failed to convert js number to serde_json::Number`, …) on a
non-boolean or non-finite value.

- `runes` mirrors upstream's `parametric` validator: it accepts any JS value and
  never rejects it. A truthy scalar (number/string) forces runes on, a real
  `false` forces legacy, and `undefined`/`null`/absent — as well as non-scalars
  like an object or function — leave the mode auto-detected.
- A genuinely wrong-typed option (e.g. `dev: 1`, `namespace: 2`) is reported as
  `Invalid compiler option: …` using the upstream message.

Accepted, N-API-imposed difference from upstream: because the compiler's `runes`
is `Option<bool>`, a falsy-but-not-`false` value (`0`, `""`, `NaN`) auto-detects
instead of forcing legacy — only a real `false` maps to `Some(false)`, so it
can't spuriously trigger the strict `runes === false` paths. A function-valued
`runes` cannot be invoked from Rust and likewise auto-detects.
