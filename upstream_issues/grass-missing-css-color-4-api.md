# `grass` is missing the `sass:color` CSS Color 4 API that dart-sass 1.79 added

`grass` 0.13.4 implements the legacy `sass:color` functions but none of the
colour-space API dart-sass introduced in 1.79, so a stylesheet written against
current dart-sass fails with `Error: Undefined function.`

## Reproduction

Each row is `@use "sass:color"; .a { x: <expr>; }`:

| expression | dart-sass | `grass` 0.13.4 |
|---|---|---|
| `color.channel(red, 'red', $space: rgb)` | OK | **`Undefined function`** |
| `color.channel(red, 'red')` | OK | **`Undefined function`** |
| `color.space(red)` | OK | **`Undefined function`** |
| `color.to-space(red, srgb)` | OK | **`Undefined function`** |
| `color.is-in-gamut(red)` | OK | **`Undefined function`** |
| `color.same(red, red)` | OK | **`Undefined function`** |
| `color.adjust(red, $lightness: 10%)` | OK | OK |
| `color.red(red)` | OK | OK |

The last two rows are the negative control: the legacy API is present, so this
is a missing feature rather than a broken `sass:color` module.

## Where it shows up

35 of the 99 units the `scss-known-failures` ratchet lists as
`grass-rejects-accepted`, led by `svelte-material-ui`, whose theme code calls
`color.channel($color, 'red', $space: rgb)`.
