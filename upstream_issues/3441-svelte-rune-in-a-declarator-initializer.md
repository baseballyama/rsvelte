# A rune in a declarator initializer is decided by a hard-coded allow-list, and two entries are wrong

`phases/3-transform/{client,server}/visitors/VariableDeclaration.js` each open with a list of the
runes that may sit in a `VariableDeclarator`'s initializer and be visited as an ordinary
expression. Anything not on the list must be matched by one of the branches below it, or the
declarator is silently not pushed.

```js
/* client */
if (
    !rune ||
    rune === '$effect.tracking' ||
    rune === '$effect.root' ||
    rune === '$inspect' ||
    rune === '$inspect.trace' ||
    rune === '$state.snapshot' ||
    rune === '$host'
) {
    declarations.push(/** @type {VariableDeclarator} */ (context.visit(declarator)));
    continue;
}
```

```js
/* server */
if (!rune || rune === '$effect.tracking' || rune === '$inspect' || rune === '$effect.root') {
```

Two entries produce broken output. Measured on svelte `5.56.9` (submodule `20b341f1`).

## 1. `$inspect` is on both lists and must not be — `const t = ;;`

`$inspect` on the list means `context.visit(declarator)` runs, and the `CallExpression` visitor
replaces an `$inspect` call with an empty statement. The declarator keeps its `=` and loses its
initializer:

```svelte
<svelte:options runes={true} />
<script>
	const t = $inspect(1);
	void t;
</script>
<b>x</b>
```

```js
/* generate: 'client' */
export default function A($$anchor) {
	const t = ;;

	void t;
	…
}
```

`generate: 'server'` produces the same `const t = ;;`. `dev: true` is correct, which is why this
survives — the dev build is the one people run. Four shapes reproduce it: `const`, `let`, a second
declarator in the same declaration (`const q = 1, t = $inspect(q)`), and `$inspect` over a
`$state` variable.

## 2. `$effect.pending` is on neither list — the declaration disappears

```svelte
<svelte:options runes={true} />
<script>
	const t = $effect.pending();
	void t;
</script>
<b>x</b>
```

```js
/* generate: 'client' — `t` is never declared */
export default function A($$anchor) {
	void t;

	var b = root();
	$.append($$anchor, b);
}
```

Rendering throws `ReferenceError: t is not defined`. The output parses, so nothing upstream of a
browser reports it.

On the server the declarator falls through to a different branch and yields `void 0` where the
rune's value is `0`:

```js
/* generate: 'server' */
const t = void 0;      // should be `const t = 0;`
```

`phases/3-transform/server/visitors/CallExpression.js:35` returns `b.literal(0)` for
`$effect.pending`, and that is what the same rune produces in every other position — so the
declarator path is inconsistent with the compiler's own answer.

## Every other position is correct

For `$effect.pending`, all of these produce `$.eager($.pending)` on the client and `0` on the
server:

| position | client | server |
|---|---|---|
| `$effect.pending();` as a statement | ok | ok |
| `{$effect.pending()}` in the template | ok | ok |
| `$derived($effect.pending())` | ok | ok |
| inside an `$effect` callback | ok | ok |
| `return $effect.pending()` in a function | ok | ok |
| `let t; t = $effect.pending();` (plain assignment) | ok | ok |
| **`const t = $effect.pending();`** | **declaration dropped** | **`void 0`** |

The assignment row is the sharpest control: the same rune, the same binding, and only the
declarator syntax differs.

## Suggested fix

Add `$effect.pending` to both lists and remove `$inspect` from both. More durably, the two lists
are the same decision written twice and they already disagree — the client allows
`$inspect.trace`, `$state.snapshot` and `$host` while the server does not — so deriving them from
one table would keep the next rune from landing in the same gap.

## Where this is referenced

rsvelte #3441 records the neighbouring `$inspect(...).with(...)` declarator, which **is** an
rsvelte defect — official handles that form correctly on all three targets — and points here for
the plain `$inspect` and `$effect.pending` halves above.
