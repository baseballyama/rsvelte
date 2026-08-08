---
"@rsvelte/compiler": patch
---

Keep the newline after a line comment that sits between two declarators.

A multi-line `let`/`const`/`var` list is accumulated onto a single line before
it is split at its top-level commas. The accumulator joined continuation lines
with a space, so a `//` comment on one of them swallowed every declarator that
followed:

```svelte
<script>
	let a,
		b = 1,
// c
		c;
</script>
```

emitted `let // c c;` — a `let` with no declarator, and output that does not
parse. Continuation lines now join with a newline whenever the text so far ends
inside a line comment, which is also the shape upstream prints.
