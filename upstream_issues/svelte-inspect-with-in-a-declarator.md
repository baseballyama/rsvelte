# `$inspect(…).with(fn)` in a declarator initializer is not treated as a rune

Oracle: `submodules/svelte` @ `5.56.9`.

`VariableDeclaration.js` (both `phases/3-transform/server/visitors/` and the client's
`javascript_visitors.js` equivalent) lists the runes whose declarator should be visited
normally:

```js
const rune = get_rune(init, context.state.scope);
if (!rune || rune === '$effect.tracking' || rune === '$inspect' || rune === '$effect.root') {
	declarations.push(context.visit(declarator));
	continue;
}
```

`'$inspect'` is there; **`'$inspect().with'` is not**. So a declarator initialised with the
`.with` form skips the `CallExpression` visitor — which would return `b.empty` in prod and the
`(fn)('init', …)` call in dev — and falls through to the `$state`-shaped tail, which builds the
declarator from `visit(init.arguments[0])`. For the outer call that argument is the *inspector*.

```js
// m.svelte.js
let a = $state(1);
const t = $inspect(a).with(console.log);
export const z = 1;
```

| target | output |
|---|---|
| `server`, `dev: false` | `const t = console.log;` |
| `server`, `dev: true` | `const t = console.log;` — the dev lowering never runs |
| `client`, `dev: false` | the declarator is **dropped entirely** |
| `client`, `dev: true` | the declarator is dropped entirely |

Two things go wrong, and they are separable:

1. `const t = console.log` binds the inspector, not the rune's result. Every other slot for the
   same expression is correct — `$inspect(a).with(console.log);` as a statement prints `;;` in
   prod and `console.log('init', a);` in dev, and `[$inspect(a).with(console.log)]` prints `[;]`.
   Only the declarator initializer diverges, so the rule is not "`.with` is unsupported here".
2. On the client the whole declaration disappears, so `t` is no longer declared and any later
   reference is a `ReferenceError` — silently, from a compile that reported no error.

The one-line fix is to add `rune === '$inspect().with'` to the condition at both sites; the
`CallExpression` visitor already handles the form in every other position.

Related: the same file's prod output for a plain `$inspect` in a declarator, `const t = ;;`, is
itself unparseable — that is the separate report in
`3441-svelte-inspect-in-an-operand-slot.md`. This one is different because the output *parses*
and means something else.

## rsvelte decision

rsvelte does not reproduce either runtime-wrong result. In prod, where `$inspect` evaluates to
nothing, it keeps the declaration as `const t = undefined`; in dev it keeps the normal rune
lowering (`$.inspect(...)` on the client and the inspector callback on the server). This also
applies to an exported declarator.

The eight cells — `{declarator, export-declarator}` × `{client, client-dev, server, server-dev}`
— are pinned by
`module_inspect_slot_3611.rs::an_inspect_with_declarator_keeps_its_binding_and_value` for #3627.
Delete the deliberate-divergence entry and change those expectations to parity if upstream adds
`'$inspect().with'` to both declarator allow-lists.
