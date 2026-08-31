# `grass` parses CSS Color 4 relative colour syntax as a Sass `rgb()` call and rejects it

`rgb(from var(--inverse) r g b / 0.517)` is CSS Color 4 relative colour syntax.
dart-sass leaves a `rgb()` it cannot evaluate as a plain CSS function call;
`grass` 0.13.4 parses it as its own `rgb()` and reports an arity error.

## Reproduction

```scss
.a { border: 1px solid rgb(from var(--inverse) r g b / 0.517); }
```

- dart-sass: emits the declaration unchanged
- `grass` 0.13.4: `Error: Only 3 elements allowed, but 5 were passed.`

## Where it shows up

3 of the 99 units the `scss-known-failures` ratchet lists as
`grass-rejects-accepted`, all in `musicat`.
