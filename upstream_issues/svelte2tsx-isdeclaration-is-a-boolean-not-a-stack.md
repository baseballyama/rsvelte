# `isDeclaration` is a boolean, so a binding pattern's second element is walked as an expression

**Repository**: `sveltejs/language-tools` (`packages/svelte2tsx`)
**Measured**: 2026-09-02, `submodules/language-tools` at the pinned revision, driven through
`packages/svelte2tsx/index.js` with the options `scripts/compat-corpus/svelte2tsx-compile.mjs`
passes: `{ filename, isTsFile, mode: 'ts', namespace: 'html', version: '5' }`.

## Summary

`processInstanceScriptContent` decides whether a `$`-prefixed identifier is a **store reference**
or a **declared name** from one boolean, `isDeclaration` (`:94`). Entering a binding element's
name sets it and pushes an on-leave callback that clears it (`:293-296`):

```ts
if (ts.isBindingElement(parent) && parent.name == node) {
    isDeclaration = true;
    onLeaveCallbacks.push(() => (isDeclaration = false));
}
```

The reset is unconditional, so leaving the **first** element of a pattern clears a flag the
enclosing pattern had set — and every element after it is walked with `isDeclaration === false`.
`handleIdentifier` (`:155`) then takes the `else` branch for that element's *property name*, where
a `$`-prefixed identifier is registered as a store auto-subscription.

The rule this produces is "a `$`-prefixed key is a name iff it is the first element of its own
pattern", which is not a rule anyone would write. A stack (or restoring the previous value
instead of assigning `false`) is what the nesting requires.

## Reduction

Both inputs destructure the same key; only the element that precedes it differs.

```svelte
<!-- A: the only element -->
<script lang="ts">
	let o: any = {};
	let { $permissions: permissions } = o;
</script>
<p>{permissions}</p>
```

```svelte
<!-- B: one plain element precedes it -->
<script lang="ts">
	let o: any = {};
	let { a, $permissions: permissions } = o;
</script>
<p>{permissions}</p>
```

Emitted:

```
A  let { $permissions: permissions } = o;

B  let { a, $permissions: permissions } = o/*Ωignore_startΩ*/;let $permissions = __sveltets_2_store_get(permissions);/*Ωignore_endΩ*/;
```

B subscribes to `permissions` — a local destructured value, not a store — and declares a
`$permissions` that shadows the key it was read from.

## The full axis

An element's index within **its own** pattern, crossed with the pattern's host. `-` is no
`__sveltets_2_store_get` call.

| source | official |
|---|---|
| `let { $permissions: permissions } = o` | `-` |
| `let { a, $permissions: permissions } = o` | `permissions` |
| `let { a, b, $permissions: permissions } = o` | `permissions` |
| `let { a = 1, $permissions: permissions } = o` | `permissions` |
| `let { x: { $permissions: permissions } } = o` | `-` |
| `let { a, x: { $permissions: permissions } } = o` | `-` |
| `let { x: { a, $permissions: permissions } } = o` | `permissions` |
| `let [a, { $permissions: permissions }] = [o, o]` | `-` |
| `function f({ a, $permissions: permissions }: any)` | `permissions` |
| `let { $p: p, $q: q } = o` | `q` |
| `let { a, $p: p, $q: q } = o` | `p`, `q` |
| `({ a, $p: p } = o)` | `-` |

The nested rows are the ones that name the mechanism: `{ a, x: { $p: p } }` is quiet because
entering the nested pattern **re-sets** the flag its sibling had cleared, while
`{ x: { a, $p: p } }` is loud for the same reason one level down. Assignment destructuring is
quiet because it is an `ObjectLiteralExpression`, which `handleIdentifier` excludes by
`!ts.isPropertyAssignment(parent) || parent.initializer == ident`.

## Real-world instance

`appwrite-console/src/routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/settings/+page.svelte`.

## Fix

Restore the previous value rather than clearing:

```ts
if (ts.isBindingElement(parent) && parent.name == node) {
    const previous = isDeclaration;
    isDeclaration = true;
    onLeaveCallbacks.push(() => (isDeclaration = previous));
}
```

The same shape applies to the `isVariableDeclaration` and `isImportClause` resets at `:284-301`.

## What rsvelte does

Byte equality is the goal, so rsvelte reproduces the rule as measured, pinned by
`crates/rsvelte_projection/tests/svelte2tsx_binding_pattern_store_key.rs`.
