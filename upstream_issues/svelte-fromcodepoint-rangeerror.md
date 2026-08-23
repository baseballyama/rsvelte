# Svelte's constant evaluator crashes compile() on `String.fromCodePoint` with an invalid code point

The official Svelte compiler (v5.56.9) rejects these components with a raw `RangeError` — no
error code, no position, no frame:

```svelte
<script>
	const v = String.fromCodePoint(-1);
</script>
<u>{v}</u>
```

```
RangeError: Invalid code point -1
```

`String.fromCodePoint(1.5)` and `String.fromCodePoint(0x110000)` fail the same way, on all
three targets and in both hosts (a `const` initializer and an inline template expression).

Same cause as [#3054](https://github.com/baseballyama/rsvelte/issues/3054), one entry along:
`phases/scope.js:26-74` stores each global as a `[type, fn]` pair whose `fn` is the real JS
function, and `evaluate` calls it unguarded when every argument is known
(`scope.js:509-522`). `String.fromCodePoint` is the one entry in that table whose function
THROWS for in-range-typed arguments, so a syntactically valid program whose call would throw
only at RUNTIME instead kills the compile with an unclassified exception.

rsvelte declines to fold those three shapes and compiles the component successfully, so this
is an error-presence divergence in rsvelte's favour: the client and server folders both check
the code point before calling `char::from_u32`
(`3_transform/server/evaluate.rs`, `eval_global_call`).

Local anchor: [#3617](https://github.com/baseballyama/rsvelte/issues/3617).

Desired upstream behavior: wrap the `fn(...)` call in the evaluator so a throwing global
yields UNKNOWN, or emit a coded compiler diagnostic.
