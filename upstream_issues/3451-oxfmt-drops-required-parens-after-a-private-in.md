# oxfmt drops the required parentheses around a private-in's right operand

`oxfmt 0.63.0` removes parentheses that carry meaning when the left operand of `in` is a private
name, while keeping them for the identical expression with an ordinary left operand.

```js
class Box {
  #value = 1;
  static a(o) { return #value in (o || {}); }
  static b(o) { return "k" in (o || {}); }
}
```

```js
/* oxfmt -c … --stdin-filepath x.js */
class Box {
  #value = 1;
  static a(o) {
    return #value in o || {};       // <- now ((#value in o) || {})
  }
  static b(o) {
    return "k" in (o || {});        // <- correct
  }
}
```

`in` binds tighter than `||`, so `a` returns `true`/`{}` after formatting where the source returns
`true`/`false`.

## Scope

| source | formatted | verdict |
|---|---|---|
| `#value in (o \|\| {})` | `#value in o \|\| {}` | **meaning changed** |
| `#value in (o ?? {})` | `#value in o ?? {}` | **meaning changed** |
| `#value in (o, {})` | unchanged | ok |
| `(#value in o) \|\| f` | `#value in o \|\| f` | ok — genuinely redundant |
| `"k" in (o \|\| {})` | unchanged | ok |
| `("k" in (o \|\| {})) && f` | `"k" in (o \|\| {}) && f` | ok |

The last two rows are the control: same operator, same right operand, ordinary left operand,
parentheses kept. So the needs-parens computation is reached for `BinaryExpression` and missed for
the private-name form — the same shape as the ESTree/oxc split that produced the rsvelte-side
defect in #3413, where `#x in o` is a `BinaryExpression` with a `PrivateIdentifier` left in ESTree
and a dedicated `PrivateInExpression` node in oxc. A formatter that computes parenthesisation per
node kind will miss the second unless it is enumerated.

## Impact here

`rsvelte-fmt` delegates embedded and standalone JavaScript to this engine, so
`rsvelte-fmt --stdin --stdin-filepath x.svelte` reproduces it on a `<script>` block and silently
rewrites the user's program (#3451).

The formatter-parity gate cannot see it: the oracle **is** oxfmt, so the defect is reproduced
identically on both sides and scores as a match by construction. A brand check also appears
nowhere in svelte.dev, which is the whole population that gate formats.

Measured with `scripts/fixtures/fmt-corpus.oxfmtrc.json`, the config the gate itself uses.
