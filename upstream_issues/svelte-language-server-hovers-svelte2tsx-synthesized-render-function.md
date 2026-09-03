# `svelte-language-server` hovers svelte2tsx's synthesized `$$render` from inside the `<script>` tag

A hover anywhere inside a component's `<script>` **start tag** — on `lang="ts"`, on the tag name,
on the whitespace between them — answers with the signature of `$$render`, a function svelte2tsx
generates and the user never wrote. Its type mentions `$$ComponentProps`, `bindings`, `slots` and
`events`, none of which exist in the source, and the reported `range` is a zero-width span at
line 0 character 1, so an editor highlights nothing while showing a tooltip.

## Reproduction

A project containing `svelte` (5.56.10), a `tsconfig.json`, and one component:

```svelte
<script lang="ts">
	let { style }: { style?: string } = $props();
</script>

<div {style}></div>
```

`textDocument/hover` at line 0, character 15 — inside `lang="ts"`:

```json
{
  "range": { "start": { "line": 0, "character": 1 }, "end": { "line": 0, "character": 1 } },
  "contents": "```typescript\nfunction $$render(): {\n    props: $$ComponentProps;\n    exports: {};\n    bindings: \"\";\n    slots: {};\n    events: {};\n}\n```"
}
```

`rsvelte-language-server` returns `null` at the same position.

## The control, in the same file and the same session

`textDocument/hover` at line 1, character 8 — on `style` in the script body — is byte-identical
on both servers:

```json
{
  "range": { "start": { "line": 1, "character": 7 }, "end": { "line": 1, "character": 12 } },
  "contents": "```typescript\nlet style: string | undefined\n```"
}
```

So this is not "one server hovers and the other does not". Hover works on both; the difference is
confined to positions that no user-authored expression covers, where the `.svelte` -> `.tsx`
projection still lands inside the generated wrapper.

## Why it looks like a defect rather than a choice

`$$render` is an implementation detail of svelte2tsx's output. It is not addressable from the
source document, "go to definition" on it leads into a virtual file, and its type names three
members (`bindings`, `slots`, `events`) that a Svelte 5 component in runes mode does not have.
A hover over markup that is not an expression has no answer to give, and `null` is that answer.
