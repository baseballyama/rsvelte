# `grass` hoists a declaration written after a nested rule

dart-sass changed this in 1.77 (the `mixed-decls` deprecation): a declaration that follows
a nested rule is emitted **where it was written**, in a second block after the nested
rules. `grass` 0.13.4 still hoists it into the first block, which is the pre-1.77
behaviour.

## Reproduction

```scss
.b { a { color: red; } background: none; }
```

- dart-sass 1.103.1: `.b a { color: red; }` then `.b { background: none; }`
- `grass` 0.13.4: `.b { background: none; }` then `.b a { color: red; }`

Measured through `crates/rsvelte_preprocess/tests/grass_serialisation.rs`.

## Why it is not cosmetic

The two outputs contain the same declarations, so a comparison keyed on the multiset of
`(selector, property, value)` calls them equal. The **order** is the cascade: a hoisted
declaration loses to a later nested-rule declaration it was written to win against. This
is the one class in the ratchet that is neither render-neutral nor a rejection.

## Where it shows up

59 of the 315 units in the `scss-known-failures` ratchet — `carbon-components-svelte` 38,
`attractions` 7, `mathesar` 5, `musicat` 3, `networking-toolbox` 2, and one each from
`appwrite-console`, `date-picker-svelte`, `huly` and `powertable`.
