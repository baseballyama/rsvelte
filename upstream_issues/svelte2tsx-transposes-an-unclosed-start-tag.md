# svelte2tsx transposes the tag name and attribute name of an unclosed start tag

With `emitOnTemplateError: true` — the mode the language server always uses
(`LSAndTSDocResolver.ts:138`) — `svelte2tsx` projects an element whose start tag
was never closed into text where the tag name and the attribute name have
swapped places and the generated call sits inside a string literal.

Input (`Z.svelte`, no `lang="ts"`; the file ends right after `on`):

```svelte
<div on
```

`svelte2tsx(text, { filename: '/tmp/Z.svelte', isTsFile: false, mode: 'ts', emitOnTemplateError: true, emitJsDoc: true, version: '5.0.0' })`
emits:

```js
;function $$render() {
async () => { "on{ svelteHTML.createElement("":true,});}div", {};
return { props: /** @type {Record<string, never>} */ ({}), exports: {}, bindings: "", slots: {}, events: {} }}
```

The attribute name `on` has moved in front of the `svelteHTML.createElement`
call, the tag name `div` has moved behind it, and the call is spelled inside a
string literal — `"on{ svelteHTML.createElement("` — so the whole statement is
not the element projection it is meant to be. `<div sty` and `<div t` reproduce
it with the attribute name substituted, so it is the shape and not the name.

Expected (what rsvelte's port emits for the same input):

```js
async () => { { svelteHTML.createElement("div", {"on":true,});}};
```

Closing the tag (`<div on>`) or giving the attribute a value and a `>` removes
it, so the trigger is specifically a start tag that reaches EOF.

## Why it is observable

An unclosed start tag with a partial attribute name is exactly what a document
looks like while an attribute is being typed, so the language server projects
this shape on nearly every keystroke inside a start tag. Because the cursor's
generated position lands inside a string literal, TypeScript offers no
completions there at all: `svelte-language-server` answers `<div on|` with 249
items, none of which carry TypeScript `data`, while the same request against a
well-formed projection of the same document yields 431 element-attribute
properties.

Measured against `submodules/language-tools` at the pinned revision.
