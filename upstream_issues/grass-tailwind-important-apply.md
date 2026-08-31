# `grass` rejects Tailwind's `!`-prefixed utility inside `@apply`

Tailwind spells an important utility `!text-black`, and `@apply` takes a list of
such class names. dart-sass parses the at-rule's prelude as an opaque token
sequence and passes it through; `grass` 0.13.4 stops at the `!`.

## Reproduction

```scss
.a { @apply bg-accent-purple !text-black; }
```

- dart-sass: emits `@apply bg-accent-purple !text-black;`
- `grass` 0.13.4: `Error: expected ";".` at the `!`

## Where it shows up

1 of the 99 units the `scss-known-failures` ratchet lists as
`grass-rejects-accepted` (`vert/src/lib/css/app.scss`).
