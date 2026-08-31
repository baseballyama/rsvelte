# A `{@render …}` tag makes the language server answer nothing for every template position

`svelte-language-server` returns `[]` from `textDocument/definition` and `null` from
`textDocument/hover` at **every** position in a component's template, in any component
whose template contains a `{@render …}` tag. The positions need not be near the tag, and
the tag need not come first.

```svelte
<!-- Probe.svelte -->
<script lang="ts">
	import type { Snippet } from "svelte";
	let { value = 1, child }: { value?: number; child?: Snippet } = $props();
	const local = 2;
</script>

<div>{value}{local}</div>
{@render child?.()}
```

Go to definition on `value` at `6:7` (0-based) — a plain moustache in a plain `<div>`:

```jsonc
// official svelte-language-server
{"result": []}
```

Delete the `{@render child?.()}` line, change nothing else, and the same request answers:

```jsonc
{"result": [{
  "originSelectionRange": {"start":{"line":6,"character":6},"end":{"line":6,"character":11}},
  "targetRange":          {"start":{"line":2,"character":7},"end":{"line":2,"character":12}},
  "targetSelectionRange": {"start":{"line":2,"character":7},"end":{"line":2,"character":12}},
  "targetUri": "…/Probe.svelte"
}]}
```

Hover behaves the same way: with the tag, `textDocument/hover` at `6:7` is `null`; without
it, it is ` ```typescript\nlet value: number\n``` `. Script positions are unaffected in
both cases — `value`, `child`, `local`, `$props` and `Snippet` all answer with the tag
present.

## What isolates it, measured

Every row below is the same script, the same server pair, the same request set, and one
template. "answers" means the two template moustaches `{value}` and `{local}` both return
a definition.

| template | `{value}` / `{local}` |
|---|---|
| `<div>{value}{local}</div>` | answers |
| `… ` + `{#if value}<span>ok</span>{/if}` | answers |
| `<div>{value}{local}{child}</div>` (Snippet import + prop present) | answers |
| `… ` + `import Sub from "./Sub.svelte"` and `<Sub label={local} />` | answers |
| `… ` + `...restProps` in the props destructure | answers |
| `… ` + `{@render child?.()}` **after** the div | **`[]`** |
| `{@render child?.()}` **before** the div | **`[]`** |

So it is the `{@render}` tag alone: the `Snippet` import, the snippet-typed prop, an
`{#if}` block, a rest prop and a component import are each individually harmless.

## Not the source map

`svelte2tsx` produces a map with segments on both generated lines involved. For the
failing input the generated body is

```ts
async () => {

 { svelteHTML.createElement("div", {});value;local; }
;__sveltets_2_ensureSnippet(child?.());
};
```

and the map carries 18 segments on the `createElement`/`value`/`local` line and 12 on the
`__sveltets_2_ensureSnippet` line. The TSX text and the map are both produced; what
consumes them stops answering.

**The mechanism is not identified.** This report states the behaviour and the isolating
axis; it does not claim a cause inside `TypeScriptPlugin.getDefinitions`,
`SvelteDocumentSnapshot.getGeneratedPosition` or the snapshot cache, because none of those
was measured.

## Versions

`svelte-language-server` at the `submodules/language-tools` pin, driven over stdio with the
same `initialize` parameters `scripts/compat-lsp/verify.mjs:247` sends.
