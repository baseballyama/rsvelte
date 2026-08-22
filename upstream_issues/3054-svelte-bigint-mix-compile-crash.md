# Svelte's constant evaluator crashes compile() on a BigInt/number mix

The official Svelte compiler (v5.56.8) rejects this component with a raw `TypeError` — no
error code, no position, no frame:

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
