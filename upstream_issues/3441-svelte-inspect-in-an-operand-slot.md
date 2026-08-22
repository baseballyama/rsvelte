# Svelte's `$inspect` removal emits a bare `;` into an operand slot

The official Svelte compiler (v5.56.9) replaces a non-dev `$inspect(…)` with an
`EmptyStatement` **as the expression**, so a call that stands in an operand slot rather
than in statement position prints as a lone `;`. Three separate shapes come out of it, and
two of them are `SyntaxError`.

`phases/3-transform/{client,server}/visitors/CallExpression.js` → `transform_inspect_rune`:

```js
if (!dev) return b.empty;
```

`b.empty` is an `EmptyStatement` node. Upstream's `CallExpression` visitor is tree-wide, so
it is reached wherever the call sits — but esrap only elides an `EmptyStatement` in a
**body** position (`languages/ts/index.js`, `body()` skips children whose `type` is
`'EmptyStatement'`). In an expression position the `EmptyStatement` handler runs and writes
its `;`.

## Reproduction

```svelte
<!-- C.svelte -->
<script>
	let a = $state(1);
	const t = $inspect(a);
	console.log(t);
</script>
<b>{a}</b>
```

`generate: 'client'` (and `'server'`), `dev: false`:

```js
const t = ;;
```

Neither acorn, oxc, esbuild nor `node --check` accepts it. The array form is the same
defect one slot over:

| source | output | parses |
|---|---|---|
| `const t = $inspect(a);` | `const t = ;;` | **no** |
| `const o = [$inspect(a)];` | `const o = [;];` | **no** |

Both are reproduced with the `.with()` form as well, where a **second** upstream defect
takes over first — see below.

## `$inspect(…).with(fn)` in a declarator never reaches that code at all

`phases/3-transform/client/visitors/VariableDeclaration.js` handles the runes branch with a
chain of `if (rune === …) { …; continue; }` arms. The list carries `'$inspect'` and
`'$inspect.trace'` but **not** `'$inspect().with'`, and the arm-chain has no fall-through,
so the declarator is never pushed into `declarations`:

```svelte
<script>
	let a = $state(1);
	const t = $inspect(a).with(console.log);
	console.log(t);
</script>
```

`generate: 'client'`, `dev: false` **and** `dev: true`:

```js
// `const t` is simply gone
console.log(t);        // ReferenceError: t is not defined
```

The server visitor has the same allow-list but ends with a generic fall-through that pushes
`b.declarator(declarator.id, value)` where `value` is the OUTER call's first argument — so
the server emits, in both modes:

```js
const t = console.log;
```

which parses, runs, and has nothing to do with `$inspect`. This is the same shape as
[#3173](3173-svelte-client-drops-an-eager-declarator.md) (`$effect.pending` /
`$state.eager` missing from the same list); the `$inspect().with` row is a third member of
it, and unlike those two it also has a *server* symptom.

## Scope, measured

`submodules/svelte` @ `20b341f10048`, `VERSION` printed at runtime as `5.56.9`.

| shape | target | dev | official | parses |
|---|---|---|---|---|
| `const t = $inspect(a)` | client | no | `const t = ;;` | **no** |
| `const t = $inspect(a)` | server | no | `const t = ;;` | **no** |
| `const t = $inspect(a)` | client | yes | `const t = $.inspect(…)` | yes |
| `const t = $inspect(a)` | server | yes | `const t = console.log('$inspect(', a, ')')` | yes |
| `const o = [$inspect(a)]` | client | no | `const o = [;]` | **no** |
| `const o = [$inspect(a)]` | server | no | `const o = [;]` | **no** |
| `const t = $inspect(a).with(f)` | client | no | *(declarator dropped)* | yes |
| `const t = $inspect(a).with(f)` | client | yes | *(declarator dropped)* | yes |
| `const t = $inspect(a).with(f)` | server | no | `const t = console.log;` | yes |
| `const t = $inspect(a).with(f)` | server | yes | `const t = console.log;` | yes |

`$inspect(a);` in **statement** position is correct in every one of those cells: the `;;` it
leaves is `body()`-elided nowhere but is a legal pair of empty statements.

## What rsvelte does instead

rsvelte fills the slot with the value the rune evaluates to — `undefined` outside dev, the
real lowering in dev — rather than reproducing an unparseable file or leaving `$inspect(…)`
in place (which would be a `ReferenceError`). Recorded in
`compatibility/deliberate-divergences.md` and pinned by
`crates/rsvelte_core/tests/inspect_operand_slot_3441.rs`.

The plain-`$inspect` half of the allow-list gap — `const t = $inspect(a)` alone — is
reported in `3441-svelte-rune-in-a-declarator-initializer.md` (rsvelte PR #3452). This file
covers what that one does not: the `.with()` form, which is absent from the list rather than
wrongly present on it, and the operand slots outside a declarator.
