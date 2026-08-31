# Svelte rejects a legal `class` static block that declares an existing name

The official Svelte compiler (v5.56.10) refuses this component:

```svelte
<script>
	let v = 1;
	class C {
		static { const v = 2; console.log(v); }
	}
</script>
{v}
```

```
declaration_duplicate: `v` has already been declared
```

A class `static {}` block is its own lexical scope, so `const v = 2` inside it shadows the
instance script's `v` exactly as a method body's `const v = 2` does. The neighbours isolate
it: a **method** body (`m() { const v = 2; … }`), an ordinary function body and a plain block
all compile, and the same static block declaring a *different* name (`const w = 2`) compiles
too. Only "static block redeclares an outer name" is rejected.

The cause is that `phases/scope.js` creates no scope for a `StaticBlock`, so its declarations
land in the enclosing (instance) scope and hit the duplicate-declaration check. It is the same
node the ESTree serialization forgets elsewhere — a static block is easy to miss because it is
the one class element that is a scope without being a function.

rsvelte compiles the component. This is an over-rejection on upstream's side, which is a
population no collected corpus can hold: published code compiles, so a file carrying this
shape does not exist to be collected. It is recorded here rather than reproduced in
`compatibility/pattern-corpus`, since a repro file would have to assert the rejection.

Reported against Svelte v5.56.10.
