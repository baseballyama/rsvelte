# A class-body TypeScript index signature crashes the compiler with a raw TypeError

A class body containing a TypeScript **index signature** — legal TypeScript — makes the Svelte
compiler throw a raw `TypeError` rather than an `InternalCompileError` with a code.

```svelte
<script lang="ts">
	class C { [k: string]: number }
</script>
```

```
TypeError: Cannot read properties of undefined (reading 'type')
```

Reproduced on `generate: 'client'` and `generate: 'server'`, against both the repository source
(`packages/svelte/src/compiler/index.js`) and the published `svelte/compiler`, both reporting
`VERSION` 5.56.10.

## Control

The same index signature inside an `interface` compiles cleanly on both targets, as does an empty
class — so it is the class-body member kind, not the syntax and not TypeScript erasure in
general.

```svelte
<script lang="ts">
	interface I { [k: string]: number }
	class C {}
</script>
```

## Why the error shape matters as much as the crash

A raw `TypeError` carries no `code`, so a consumer that classifies compile failures by code — a
build plugin, an editor integration, a differential harness — cannot tell this from an internal
failure. Every other TypeScript-only class member checked alongside it (`declare`, `abstract`,
`?`, `!`, the visibility modifiers, `override`, a typed method, a generic method, a typed getter)
either compiles or raises a coded diagnostic.

Tracked in this repository as #4197.
