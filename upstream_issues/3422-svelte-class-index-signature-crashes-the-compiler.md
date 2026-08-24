# A TypeScript class index signature crashes `compile()` with a bare `TypeError`

A class index signature is valid TypeScript and `parse()` accepts it, but `compile()` throws a
plain `TypeError` — no `code`, no position, no frame. A consumer catching `CompileError` gets an
unhandled exception instead of a diagnostic.

```svelte
<script lang="ts">
	class K { [k: string]: unknown }
	void K;
</script>
<b>x</b>
```

```
TypeError: Cannot read properties of undefined (reading 'type')
    at Context.visit (esrap/src/context.js:90:39)
    at TSIndexSignature (esrap/src/languages/ts/index.js:2004:12)
```

Measured on svelte `5.56.9` (submodule `20b341f1`) with esrap `2.2.12`, on `generate: 'client'`,
`generate: 'server'` and `dev: true` alike. `parse(source, { modern: true })` succeeds and yields
a `TSIndexSignature` whose `typeAnnotation` is a `TSTypeAnnotation`, so the node is well-formed
coming out of the parser.

Five variants reproduce it: `[k: string]: unknown`, `[k: number]: string`,
`readonly [k: string]: unknown`, `static [k: string]: unknown`, and one inside a class
*expression*. An **interface** index signature is fine, because `TSInterfaceDeclaration` is
removed wholesale.

## Cause

Two things have to be true at once, and they are.

`phases/1-parse/remove_typescript_nodes.js`'s catch-all visitor strips annotation fields from
every node it walks:

```js
_(node, context) {
    const n = context.next() ?? node;
    // TODO there may come a time when we decide to preserve type annotations.
    // until that day comes, we just delete them so they don't confuse esrap
    delete n.typeAnnotation;
    …
}
```

For a `TSIndexSignature`, `typeAnnotation` is not decoration — it is the required value type. And
the node itself is not removed: `ClassBody` in the same file filters only one member kind,

```js
ClassBody(node, context) {
    const body = [];
    for (const _child of node.body) {
        const child = context.visit(_child);
        if (child.type !== 'PropertyDefinition' || !child.declare) {
            body.push(child);
        }
    }
    …
}
```

so the signature reaches the printer with its required child deleted. esrap then dereferences it
without a guard — note that the line immediately above it already uses optional chaining on the
same field:

```js
TSIndexSignature(node, context) {
    context.write('[');
    sequence(context, node.parameters, node.typeAnnotation?.loc?.start ?? null, false);
    context.write(']');
    context.visit(node.typeAnnotation);   // <- undefined by the time we get here
},
```

## Suggested fix

A class index signature has no runtime meaning, so `ClassBody` should drop it the way
`TSInterfaceDeclaration` and `TSTypeAliasDeclaration` are dropped — filtering `TSIndexSignature`
alongside the `declare` `PropertyDefinition` case is enough to make the crash unreachable.

Guarding esrap's `context.visit(node.typeAnnotation)` is worth doing independently: an index
signature with no value type is not printable, and the current failure mode is a `TypeError` from
inside the printer rather than anything a caller can act on.

## Related

The same sweep found a second class-member shape that survives `remove_typescript_nodes` and
should not — see
[`3421-svelte-class-method-overload-signature-emits-unparseable-output.md`](./3421-svelte-class-method-overload-signature-emits-unparseable-output.md).
Both are `ClassBody` keeping a member that has no JavaScript form.
