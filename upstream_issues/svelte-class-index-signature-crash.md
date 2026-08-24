# A TypeScript index signature in a class body crashes the official compiler

```svelte
<script lang="ts">
	class S {
		[key: string]: unknown;
	}
	const v = typeof S;
</script>

<b>{v}</b>
```

```
TypeError: Cannot read properties of undefined (reading 'type')
    at Context.visit (esrap/src/context.js:90:39)
    at TSIndexSignature (esrap/src/languages/ts/index.js:2004:12)
    at Object._ (esrap/src/languages/ts/index.js:964:4)
    at body (esrap/src/languages/ts/index.js:454:18)
    at BlockStatement|ClassBody (esrap/src/languages/ts/index.js:536:4)
```

Both `generate: 'client'` and `generate: 'server'`, Svelte 5.56.9 with
esrap 2.2.12. The error carries no `code`, so it is not a `CompileError` — it
escapes as a bare `TypeError` and no `svelte:options` or compile option avoids
it.

esrap's `TSIndexSignature` printer ends with

```js
context.visit(node.typeAnnotation);
```

and the node acorn-typescript builds for a **class-body** index signature has no
`typeAnnotation`. The line above it already guards the same field
(`node.typeAnnotation?.loc?.start ?? null`), so the optional access and the
unguarded one disagree about whether it can be absent.

The two neighbouring hosts are fine, because a type-only declaration never
reaches the printer:

| host | verdict |
|---|---|
| `interface I { [k: string]: unknown }` | compiles |
| `type T = { [k: string]: unknown }` | compiles |
| `class S { [k: string]: unknown }` | **crash** |

rsvelte compiles all three, so the shape cannot be added to
`compatibility/pattern-corpus/` — the corpus requires official to accept the
file.
