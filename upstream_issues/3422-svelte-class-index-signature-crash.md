# A TypeScript class index signature crashes the compiler with a bare `TypeError`

A class **index signature** — `[k: string]: unknown` — makes `svelte.compile` throw a
`TypeError` with no `code`, no position and no frame, on every target.

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

Measured against `submodules/svelte` at 5.56.9 with esrap 2.2.12.

## Cause

`phases/1-parse/remove_typescript_nodes.js` erases type-only syntax with a catch-all visitor that
deletes `typeAnnotation` wherever it finds one, and its `ClassBody` visitor keeps every child that
is not a `declare` `PropertyDefinition`. A `TSIndexSignature` is neither removed nor emptied: it
survives into the printed program with its `typeAnnotation` gone. esrap's `TSIndexSignature`
printer then visits that field unguarded, and `Context.visit` reads `.type` off `undefined`.

So the two halves disagree — the eraser assumes nothing will print a `TSIndexSignature`, and the
printer assumes nothing will delete its `typeAnnotation`.

## Reproduces on

Every spelling and every host, on `client`, `client` + `dev` and `server`:

| member | crashes |
|---|---|
| `[k: string]: unknown` | yes |
| `[k: number]: string` | yes |
| `readonly [k: string]: unknown` | yes |
| `static [k: string]: unknown` | yes |
| two index signatures in one body | yes |
| an index signature beside a `$state` field | yes |
| the same, in a class **expression** | yes |
| the same, in `<script module lang="ts">` | yes |

## Controls

Eleven other TypeScript-only class-body constructs compile cleanly on all three targets:
`declare x: number`, `y?: number`, `z!: number`, `private` / `protected` / `public` / `readonly`
modifiers, a typed method, a generic method, a typed getter, and a plain field. So this is one
member kind, not TypeScript erasure in general.

## Desired upstream behavior

Drop a `TSIndexSignature` from a `ClassBody` the way `remove_typescript_nodes.js` already drops a
`TSInterfaceDeclaration` and a `TSTypeAliasDeclaration`. An index signature is type-only and has no
runtime representation; TypeScript's own emit removes it.

rsvelte erases it, so rsvelte compiles these inputs and upstream does not — there is no output to
be byte-equal to. No corpus entry carries the shape, because a component containing one cannot be
built with the official compiler at all.
