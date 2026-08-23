# Svelte's constant evaluator crashes compile() on a BigInt/number mix

The official Svelte compiler (v5.56.8, still v5.56.9) rejects this component with a raw
`TypeError` — no error code, no position, no frame:

```svelte
<p>{1 + 2n}</p>
```

```
TypeError: Cannot mix BigInt and other types, use explicit conversions
```

`{+2n}` fails the same way (`Cannot convert a BigInt value to a number`), as do the same
expressions inside `$derived(...)`, `$state(...)` initializers, or a plain `let`.

The cause is compile-time constant evaluation (`phases/scope.js`, `evaluate`): binary and
unary arithmetic is performed with real JS operators on the literal operands, and the BigInt
mixing rules make the operator itself throw. Nothing catches it, so a syntactically valid
program whose addition would throw only at RUNTIME instead kills the compile with an
unclassified exception.

rsvelte's fold bails on the mix and compiles the component successfully, so this is an
error-presence divergence: the corpus candidate exercising it
(`numeric-extremes.svelte`) is held out of `compatibility/pattern-corpus` until upstream
decides the behavior (fold to unknown, or report a coded diagnostic).

Local anchor: [#3054](https://github.com/baseballyama/rsvelte/issues/3054).

Desired upstream behavior: wrap the arithmetic in the evaluator so a throwing operator
yields UNKNOWN, or emit a coded compiler diagnostic.

## Five families, not one (measured while fixing #3539)

A 6,510-cell sweep (bigint operand × operator × 7 hosts × 3 targets) against v5.56.9 puts
**1,590 cells** in this class, and mixing is only the largest of five distinct throws. Every
one is a syntactically valid program that would throw at RUNTIME and instead kills the
compile:

| message | expressions | cells |
|---|---|---|
| `TypeError: Cannot mix BigInt and other types…` | `2n <op> 1`, `2n <op> 'x'`, `2n <op> true`, `2n <op> null`, `2n <op> undefined` and the mirrored forms, for every arithmetic and bitwise operator | 1,395 |
| `TypeError: Cannot convert a BigInt value to a number` | unary `+1n`; also `Math.max(1n, 2n)`, `Math.abs(-1n)`, `Math.floor(1n)`, `String.fromCharCode(65n)` — anything in the `globals` table whose `fn` applies `ToNumber` | 75 |
| `TypeError: BigInts have no unsigned right shift…` | `1n >>> 1n` | 60 |
| `RangeError: Division by zero` | `1n / 0n`, `1n % 0n` | 30 |
| `RangeError: … must be positive` | `2n ** -1n` | 30 |

Five of the seven hosts crash, identically on all three targets: a text expression, a
`const` read later, a `$derived`, a `{@const}`, and a `const` read through a second `const`.
The two that do not are an **attribute** value and a **class-field** initializer, which the
evaluator never reaches — so "does it crash" is decided by the position, not by the
expression, and a repro placed in an attribute reports nothing.

The `globals` row is the one the existing note above does not cover — it is a second call
site (`fn(...values.map(e => e.value))` in the `CallExpression` case), so a `try` around the
`binary` / `unary` tables alone would not close it.

rsvelte declines to fold all five (there is no value to fold — the expression throws), and
compiles every one of them successfully.
