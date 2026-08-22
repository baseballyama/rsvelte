# A TypeScript class-method overload signature is not erased, so the compiler emits output no JS parser accepts

The TypeScript eraser removes a `MethodDefinition` only when it is `abstract`
(`phases/1-parse/remove_typescript_nodes.js:156-161`). An **overload
signature** — a member with a signature and no body — is not abstract, so it
survives into the generated JavaScript as a class member with no body.

```svelte
<script lang="ts">
	class K {
		m(a: number): number;
		m(a: any) { return a; }
	}
	const v = 1;
</script>
<b>{v}</b>
```

`svelte.compile(..., { generate: 'server' })` — the same on `client` and on
`client` + `dev` — produces:

```js
class K {
	m(a) 

	m(a) {
		return a;
	}
}
```

`acorn.parse` rejects it with `Unexpected token`. Measured against
`submodules/svelte` 5.56.9.

Six member shapes reproduce it, in an instance script and in `<script module>`,
on all three targets:

| member | erased output | parses |
|---|---|---|
| `m(a: number): number;` | `m(a)` with no body | **no** |
| two signatures + implementation | both signatures kept | **no** |
| `static m(a: number): number;` | `static m(a)` with no body | **no** |
| `constructor(a: number);` | `constructor(a)` with no body | **no** |
| `#m(a: number): number;` | `#m(a)` with no body | **no** |
| `get m(): number;` | `get m()` with no body | **no** |
| `const K = class { m(a: number): number; … }` | same, in a class expression | **no** |

The neighbouring cases all erase correctly, which is what isolates the bodiless
member:

| shape | erased output | parses |
|---|---|---|
| `abstract m(a: number): number;` | member dropped entirely | yes |
| `function f(a: number): number;` + impl (a `TSDeclareFunction`) | declaration dropped entirely | yes |
| the same class with the signature removed | unchanged | yes |

So a **function** overload is dropped and a `MethodDefinition` overload is not,
and an `abstract` method is dropped while a bodiless non-abstract one is not.
TypeScript's own emit drops every one of them, since an overload signature has
no runtime representation.

Desired upstream behavior: drop a bodiless `MethodDefinition` the way an
`abstract` one is already dropped.

rsvelte drops it, so rsvelte's output for this input parses and upstream's does
not — byte parity here would mean reproducing invalid JavaScript. This is the
same shape as `3082-svelte-abstract-property-not-erased.md`, one member kind
over.

No corpus entry carries the shape, and no gate would report it either way: the
output-parseability gate parses rsvelte's side only, and the output-equality
gates score `match`/`mismatch` without asking whether either side is
JavaScript.
