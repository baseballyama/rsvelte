# Svelte emits a bare `;` where a production-mode `$inspect(…)` stood in a value position

The official Svelte compiler (v5.56.9) lowers `$inspect(…)` and `$inspect(…).with(…)` to
an **`EmptyStatement`** when `dev` is false — `client/visitors/CallExpression.js`
(`transform_inspect_rune`: `if (!dev) return b.empty`) and
`server/visitors/CallExpression.js` (`if (rune === '$inspect' …) { if (!dev) return b.empty; }`).

In statement position that is harmless: the `ExpressionStatement` survives with an
`EmptyStatement` as its expression, and esrap prints the pair as `;;`. In any **value**
position the same node prints as a bare `;`, which no JavaScript parser accepts. Both
targets are affected, and so is `compileModule`.

## Reproduction

```svelte
<script>
	let v = $inspect(1);
</script>
<b>{typeof v}</b>
```

| entry point | target | official output |
|---|---|---|
| `compile` | client | `let v = ;;` |
| `compile` | server | `let v = ;;` |
| `compileModule` (`export const v = $inspect(1);`) | client | `export const v = ;;` |
| `compileModule` | server | `export const v = ;;` |

An argument slot is the same defect without the extra `;`:

```js
// compileModule('export const o = [$inspect(1)];', { generate: 'client' })
export const o = [;];
```

Every one of those is a `SyntaxError`, so a build using this output fails at bundle time.
`$inspect(1).with(fn)` behaves identically. In `dev` the same inputs are well-formed
(`$.inspect(() => [1], …)` on the client, `console.log('$inspect(', 1, ')')` on the server),
so only the production lowering is wrong.

## Why rsvelte does not reproduce it

Byte equality with upstream is this project's goal, but reproducing a divergence whose
output no parser accepts is not — the same decision recorded in
[`3173-svelte-client-drops-an-eager-declarator.md`](3173-svelte-client-drops-an-eager-declarator.md).

`$inspect(…)` evaluates to `undefined` in both modes (`$.inspect` returns nothing, and the
production lowering removes the call entirely), so rsvelte fills the operand slot with
`undefined`:

| input | official | rsvelte |
|---|---|---|
| `let v = $inspect(1);` (instance script, client) | `let v = ;;` | `let v = undefined;` |
| `const o = [$inspect(1)];` (instance script, client) | `const o = [;];` | `const o = [undefined];` |
| `export const v = $inspect(1);` (module, client) | `export const v = ;;` | `export const v = undefined;` |
| `export const v = $inspect(1);` (module, server) | `export const v = ;;` | `export const v = undefined;` |
| `$inspect(1);` (statement, client) | `;;` | `;;` — unchanged, still byte-equal |

The statement position is deliberately left alone: upstream's `;;` is valid there and
rsvelte already matched it.

Local anchor: [#3213](https://github.com/baseballyama/rsvelte/issues/3213).

Desired upstream behavior: return an expression rather than a statement — `b.void0` would
keep every position well-formed, and the `ExpressionStatement` case would then print
`void 0;` instead of `;;`.
