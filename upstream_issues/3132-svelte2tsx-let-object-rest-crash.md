# svelte2tsx throws on a `let:` value that destructures with an object rest

`svelte2tsx` (language-tools, `packages/svelte2tsx`) kills the conversion with a raw
`TypeError` — no diagnostic, no position — when a `let:` directive's value is an object
pattern carrying a rest element:

```svelte
<script>
	import C from './C.svelte';
</script>

<C><b slot="s" let:v={{ a, ...r }}>{a}{r}</b></C>
```

```
TypeError: Cannot read properties of undefined (reading 'type')
    at extract_identifiers (svelte2tsx/index.js)
    at handle_prop (svelte2tsx/index.js)
    at extract_identifiers (svelte2tsx/index.js)
    at handleScopeAndResolveLetVarForSlot (svelte2tsx/index.js)
    at handleComponentLet (svelte2tsx/index.js)
```

`handle_prop` reads `property.value.type` for each property of the `ObjectPattern`, and a
`RestElement` child has `argument`, not `value`.

The neighbouring shapes are all handled: `let:v={{ a }}`, `let:v={[a]}`, `let:v={[a = 1]}`,
`let:v={[a, ...t]}` (an **array** rest), `let:v={{ m: { n } = {} }}` and
`let:v={[s, [av] = []]}` all convert. Only the object rest reaches the crash, and the Svelte
compiler accepts the component on every target, so this is a tooling-only failure on a valid
program: `svelte-check` and the language server report nothing for the file at all.

rsvelte's svelte2tsx port converts it, which is what surfaced the divergence — the corpus
parity gate scores the pair as `error-mismatch` (official errors, rsvelte compiles). The
shape is held out of `compatibility/pattern-corpus` until upstream decides the behaviour.

Desired upstream behaviour: read `argument` for a `RestElement` in `handle_prop`, the way
the array-pattern path already does.
