# A TypeScript class method overload signature is emitted as a bodiless method, so the output does not parse

A method overload signature inside a class survives type stripping and is printed with no body,
which is not a legal class member. `compile()` returns successfully and the JavaScript it hands
back is rejected by every parser.

```svelte
<script lang="ts">
	class K {
		m(a: number): number;
		m(a: any) { return a; }
	}
	const v = new K().m(1);
</script>
<b>{v}</b>
```

```js
/* generate: 'client' */
class K {
	m(a) 

	m(a) {
		return a;
	}
}
```

`acorn` rejects that at the second `m`. `generate: 'server'` and `dev: true` produce the same
shape. Measured on svelte `5.56.9` (submodule `20b341f1`).

Six member forms reproduce it — an instance method, two stacked signatures, `static`, a
`constructor` overload, a `#private` method, and a class *expression* — from both the instance
script and `<script module>`.

## The function form is already handled, which is what makes this look like an oversight

```ts
function f(a: number): number;
function f(a: any) { return a; }
```

compiles correctly. `acorn-typescript` models a bodiless *function* overload as a
`TSDeclareFunction`, and `phases/1-parse/remove_typescript_nodes.js` drops it:

```js
TSDeclareFunction() {
    return b.empty;
},
```

A bodiless *method* is not a distinct node type — it is an ordinary `MethodDefinition` whose
`value.body` is absent — and the visitor for that node only removes the abstract case:

```js
MethodDefinition(node, context) {
    if (node.abstract) {
        return b.empty;
    }
    return context.next();
},
```

so the overload signature is kept and printed. `abstract m(a: number): number;` inside an
`abstract class` is correct today, via that same `node.abstract` branch, which isolates the axis
to a missing `value.body`.

## Suggested fix

Extend the `MethodDefinition` branch to drop a signature with no body:

```js
MethodDefinition(node, context) {
    if (node.abstract || !node.value.body) {
        return b.empty;
    }
    return context.next();
},
```

## Related

The same sweep found a class index signature reaching the printer with a required field deleted,
crashing with a bare `TypeError` — see
[`3422-svelte-class-index-signature-crashes-the-compiler.md`](./3422-svelte-class-index-signature-crashes-the-compiler.md).
Both are `ClassBody` keeping a member that has no JavaScript form.
