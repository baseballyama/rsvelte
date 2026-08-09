---
"@rsvelte/compiler": patch
---

Lower a write to a private `$derived` class field to a setter call on the server

On the server a private `$derived` field holds a callable, so upstream reads it as
`this.#f()` and writes it as `this.#f(v)`. rsvelte's read-wrapping pass decided
read-versus-write by looking at the byte after `this.#f` and accepted only a bare
`=`, so a compound operator saw `+`, `&`, `>` … and the *assignment target* was
wrapped:

```js
export class R {
	#a = $state(1);
	#d = $derived(this.#a * 2);

	constructor() {
		this.#d += 1;
	}
}
```

emitted `this.#d() += 1;` where official emits `this.#d(this.#d() + 1);`. A call
expression is not a valid assignment target, so the module does not parse and
Vite/Rolldown reject it. All nine compound operators were affected, in a
constructor and in a method body alike.

The quiet half was a plain `this.#d = v` **outside** a constructor: the setter
rewrite only ran on constructors, so a method body kept the assignment, replaced
the callable with a plain value, and the next read threw `this.#d is not a
function`. That output parsed, so no parse-level check could see it.

Both are now handled in one place, for constructors, methods and arrow-function
class fields.
