# svelte2tsx throws when an `is` attribute's first value chunk is a mustache

`svelte2tsx` (language-tools, `packages/svelte2tsx`) kills the conversion with a raw
`TypeError` — no diagnostic, no position — when a lowercase element carries an `is`
attribute whose **first** value chunk is a mustache tag:

```svelte
<script lang="ts">
	import C from './C.svelte';
	let x: any;
</script>

<div is={x}>a</div>
```

```
TypeError: Cannot read properties of undefined (reading 'includes')
    at Element.isCustomElement   (svelte2tsx/index.js:2310:218)
    at transformAttributeCase    (svelte2tsx/index.js:2735:53)
    at handleAttribute           (svelte2tsx/index.js:2760:15)
```

`src/htmlxtojsx_v2/nodes/Element.ts:267-271` reads the attribute's first chunk through an
optional chain that stops one level short:

```js
if (
    this.node.attributes
        ?.find((a: BaseNode) => a.name === 'is')
        ?.value[0]?.data.includes('-')
) {
```

It guards "no `attributes`", "no `is`" and "no `value[0]`", but not the case where `value[0]`
**exists and carries no `data`** — a `MustacheTag`.

The axis is neither the presence of `is` nor the presence of a mustache, but that the
**first** chunk of the value is one. Three controls separate it, and all three convert:

| input | official | rsvelte |
|---|---|---|
| `<div is={x}>a</div>` | **throws** | `createElement("div", { "is":x,})` |
| `<div is="{x}y-z">a</div>` | **throws** | ``createElement("div", { "is":`${x}y-z`,})`` |
| `<C is={x}>a</C>` | ok | ok |
| `<div is="x-y">a</div>` | ok | ok |
| `<div is="x-y{x}">a</div>` | ok | ok |

The third row is the gate — `Attribute.ts:143-145` calls the predicate only when
`element instanceof Element && parent.type === 'Element'`, so a component never reaches it.
The fifth is the discriminating one: a mustache anywhere but the first position is fine,
because `value[0]` is then a `Text`.

`<div is={x}>` is a valid Svelte document: the official *compiler* accepts it on every
target, and so does rsvelte. Only `svelte2tsx` fails, so `svelte-check` and the language
server report nothing for the whole file.

**Population.** Over the 33,904 `.svelte` files of the compatibility corpus, 165 carry an
`is=` attribute, 158 of those have a value whose first chunk is a mustache, and **0** of
those 158 sit on a lowercase tag — every one is a component, which the gate above excludes.
All 158 were run through the official converter: 0 crashes, 0 other throws, 158 ok. The two
witnesses above are therefore constructed, not collected.

rsvelte's svelte2tsx port converts both witnesses, which is what a divergence here would look
like: the corpus parity gate scores such a pair as `error-mismatch` (official errors, rsvelte
converts). **No entry of `compatibility/svelte2tsx-known-failures.json` names this shape,
because the corpus holds 0 carriers of it** — a defect that does not appear in a ratchet is
not a defect that does not exist, and the 158-file measurement above is exactly that
distinction. The shape is held out of `compatibility/pattern-corpus` until upstream decides
the behaviour, the same choice as
[`3132-svelte2tsx-let-object-rest-crash.md`](3132-svelte2tsx-let-object-rest-crash.md).

Measured against `submodules/language-tools` pinned at
`092af3826bada5cd591b0efccc39eed970169465`, both sides with
`{filename:'C.svelte', isTsFile:true, mode:'ts', namespace:'html', version:'5'}`.

Desired upstream behaviour: `?.data?.includes('-')`, so a non-`Text` first chunk means "not a
custom element" instead of a crash.
