# `abstract` on a class property is not erased, so the compiler emits output no JS parser accepts

The TypeScript eraser strips the accessibility modifier and the type annotation
from an abstract class **property** but leaves the `abstract` keyword itself, so
the generated JavaScript contains two adjacent identifiers.

```svelte
<script lang="ts">
	abstract class B {
		abstract kind: string;
	}
	const b = 1;
</script>

<p>{b}</p>
```

`svelte.compile(..., { generate: 'server' })` — the same on every target —
produces:

```js
class B {
	abstract kind;
}
```

`acorn.parse` rejects it with `Unexpected token (5:11)`. `protected abstract
kind: string` behaves identically; the `protected` half is erased correctly.

The neighbouring cases all erase correctly, which is what isolates the property
path:

| member | erased output | parses |
|---|---|---|
| `abstract kind: string;` | `abstract kind;` | **no** |
| `protected abstract kind: string;` | `abstract kind;` | **no** |
| `abstract m(): void;` | member dropped entirely | yes |
| `declare size: number;` | member dropped entirely | yes |
| `protected kind: string = "k";` | `kind = "k";` | yes |

So an abstract **method** is dropped, an abstract **property** is not.
TypeScript's own emit drops both, since an abstract member has no runtime
representation.

Desired upstream behavior: drop an abstract property declaration the way an
abstract method declaration is already dropped.

rsvelte drops it, so rsvelte's output for this input parses and upstream's does
not — byte parity here would mean reproducing invalid JavaScript. No corpus
entry carries the shape, and no gate would report it either way: the output
parseability gate parses rsvelte's side only.
