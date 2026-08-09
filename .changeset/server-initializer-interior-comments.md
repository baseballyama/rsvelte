---
"@rsvelte/compiler": patch
---

Keep a comment interior to a declaration's initializer in `generate: 'server'` output

A comment inside a `let` / `const` / `var` initializer was dropped and the
multi-line layout around it re-flowed onto one line:

```svelte
<script>
	let data = {
		/* c */
		a: 1
	};
	function go() { data = { a: 2 }; }
</script>

<p on:click={go}>{data.a}</p>
```

```js
// official          // rsvelte before
let data = {         let data = { a: 1 };
	/* c */
	a: 1
};
```

This is not a bracket-scanner defect: a plain `/* c */` with no delimiter in it
diverged identically to `/* } c */`. The server rebuilds a declaration from
re-parsed SUB-slices — the pattern from one slice, the initializer from another —
so the emitted statement's nodes carry no coherent set of source positions and the
comment carry-over can only collapse every span onto one address. That is enough
for a leading comment (they all flush before the statement) but destroys every
interior position, so an interior comment has nowhere to land.

A declaration whose lowering is nothing but that re-parse plus init read-wrapping
is now re-parsed WHOLE from its source span instead, the same way function
declarations, `if` blocks and `$:` statements already were, so its spans stay
coherent and the printer places the comment where the source put it. Declarations
that really are rewritten — a prop lowered to `$$props['x']`, a destructured
`$state` expanded into a temp group, a rune initializer, a multi-declarator
declaration split into one statement per declarator — keep the per-declarator
rebuild. Client and client-dev output is unchanged.
