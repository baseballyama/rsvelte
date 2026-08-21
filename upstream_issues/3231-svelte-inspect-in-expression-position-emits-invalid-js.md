# Svelte's non-dev `$inspect` removal emits invalid JS when the call is in expression position

The official Svelte compiler (v5.56.9) lowers a non-dev `$inspect(...)` by returning `b.empty`
from the `CallExpression` visitor. `b.empty` is an `EmptyStatement`, so the replacement is a
**statement** substituted wherever the **expression** was — and esrap prints an
`EmptyStatement` as `;`. In statement position that is the intended `;;` (the empty replaces
the call, and the surrounding `ExpressionStatement` adds its own `;`). In every other position
the `;` lands inside an expression.

Both `generate: 'client'` and `generate: 'server'` are affected, byte for byte identically.

## Reproduction

```js
// m.svelte.js — compileModule(src, { generate: 'client' | 'server', dev: false })
export const x = $inspect(1);
```

```js
export const x = ;;
```

Five shapes produce output that no JavaScript parser accepts (checked with acorn
`ecmaVersion: 'latest'`, `sourceType: 'module'`; the two-line header is elided):

| input | output |
|---|---|
| `export const x = $inspect(1);` | `export const x = ;;` |
| `export const f = (a) => $inspect(a);` | `export const f = (a) => ;;` |
| `return [$inspect(a)];` | `return [;];` |
| `($inspect(a), console.log(a));` | `(;, console.log(a));` |
| `console.log($inspect(a));` | `console.log(;);` |

Two more shapes parse and are **silently wrong**, which is the worse half:

| input | output | effect |
|---|---|---|
| `return $inspect(a) + 1;` | `return ; + 1;` | ASI splits it: the function returns `undefined` and `+1;` becomes dead code |
| `if (a) $inspect(a);` | `if (a) ;;` | the second `;` is a sibling statement, not part of the `if` — harmless here, but the consequent is no longer the replaced node |

`$inspect(a).with(fn)` behaves the same way; the `with` member call is dropped along with the
call it hangs off.

## Cause

`phases/3-transform/{client,server}/visitors/CallExpression.js` opens with

```js
if (rune === '$inspect' && !state.options.dev) {
	return b.empty;
}
```

and the caller substitutes that return value into whatever slot the `CallExpression` occupied.
Nothing checks that the slot is a statement. The `ExpressionStatement` visitor has the
matching special case for `$inspect.trace`, which is why `$inspect.trace(...)` is removed
cleanly at statement level and does not reach this path.

An expression-position replacement would need an expression — `b.void0`, or `b.literal(undefined)` —
rather than `b.empty`. The validator does not reject `$inspect` in expression position, so
today there is no diagnostic either.

## Notes for rsvelte

rsvelte reproduces the statement-position `;;` exactly (that is issue #3231) and deliberately
does **not** reproduce these five unparseable outputs: emitting text no JS parser accepts to
match a byte would defeat the parse gate. They are the residual 8 cells of the #3231
28-case × 2-target parity grid, together with `if (a) $inspect(a);`, where rsvelte prints the
semantically identical `if (a) ;\n\n;`.
