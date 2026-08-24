# Svelte emits `let v = ;;` for a declarator initialized by `$inspect(...)`

The official Svelte compiler (v5.56.9) emits text no JavaScript parser accepts when
`$inspect(...)` is used as a declarator initializer, on **both** the client and the server.
`$inspect(...).with(...)` in the same position is worse: the client drops the declaration
and the server keeps the `.with` **handler** as the declared value.

`$inspect` is a statement rune — it returns nothing — so the input is degenerate. But
"degenerate" is what `e.rune_invalid_usage` exists for; emitting a `SyntaxError` from a
compile that reports success is a different outcome from rejecting it.

## Mechanism

`phases/3-transform/{client,server}/visitors/VariableDeclaration.js` open their runes branch
with a skip list that keeps the declarator and visits it normally:

```js
if (!rune || rune === '$effect.tracking' || rune === '$effect.root' ||
    rune === '$inspect' || rune === '$inspect.trace' ||
    rune === '$state.snapshot' || rune === '$host') {
    declarations.push(context.visit(declarator));
    continue;
}
```

`$inspect` is on that list, so the declarator survives — and then the `CallExpression`
visitor lowers `$inspect(...)` to a statement-shaped replacement with no expression value,
so the printer emits an empty initializer followed by the lowered statement's own `;`.

This is the mirror image of [#3173](https://github.com/baseballyama/rsvelte/issues/3173):
there, `$effect.pending` / `$state.eager` are **absent** from the list and the declarator is
dropped; here, `$inspect` is **present** and the declarator is kept but has nothing to
initialize it with. One list, two opposite failures.

## Reproduction

```js
// m.svelte.js — compileModule(src, { generate: 'client' | 'server' })
let v = $inspect(1);
```

| source | client | server |
|---|---|---|
| `let v = $inspect(1);` | `let v = ;;` | `let v = ;;` |
| `const v = $inspect(1);` | `const v = ;;` | `const v = ;;` |
| `export const v = $inspect(1);` | `export const v = ;;` | `export const v = ;;` |
| `for (let v = $inspect(1); ; ) {}` | `for (let v = ;; ; ) {}` | `for (let v = ;; ; ) {}` |
| `let a = 1, v = $inspect(1), c = 3;` | `let a = 1, v = ;, c = 3;` | `let a = 1, v = ;, c = 3;` |
| `let v = $inspect(1).with(() => {});` | *(whole declaration dropped)* | `let v = () => {};` |

Every row in the first five is a `SyntaxError` for every JS parser, so a build using this
output fails at bundle time rather than at run time.

The last row is the quiet one: on the server `v` is bound to the `.with` **callback**, which
is a plausible-looking value the author never wrote, and nothing warns.

The same shapes reproduce in a component `<script>` as well as in a `.svelte.js` module.

## What rsvelte does today

Neither compiler is right here, and rsvelte is wrong differently:

| source | rsvelte client | rsvelte server |
|---|---|---|
| `let v = $inspect(1);` | `let v = ;` — **also does not parse** | `let v = $inspect(1);` — `$inspect is not defined` at run time |
| `let v = $inspect(1).with(() => {});` | `let v = ;` | `let v = $inspect(1).with(() => {});` |

So this is not only an upstream report. rsvelte's client output is unparseable on its own
account, and its server output leaves a rune call in the emitted module. Tracked locally as
[#3213](https://github.com/baseballyama/rsvelte/issues/3213) row 3.

Byte equality with upstream is this project's goal, but reproducing `let v = ;;` would mean
deliberately emitting text no parser accepts — the class the parse gate exists to prevent —
so matching is not the obvious answer and the cells want an explicit decision. The
well-formed option consistent with #3173's reasoning is `let v = void 0;` on both targets:
it parses, it is what upstream's own server visitor produces for a rune with no dedicated
arm (`args[0] ?? void 0`), and it makes `typeof v` answer `"undefined"` rather than throwing.

Desired upstream behavior: either reject `$inspect` in a value position with
`rune_invalid_usage`, or give the skip-listed statement runes the same
`args[0] ?? b.void0` fall-through the server's non-skip-listed path already has.
