# `oxfmt --svelte` collapses a CSS escape's terminator space, turning a live rule dead

- **Project**: `oxc-project/oxc` (`oxfmt`, `svelte: true` — the path that formats an embedded `<style>`)
- **Version measured**: `oxfmt@0.64.0`, config `{ "svelte": true, "printWidth": 80, "tabWidth": 2, "useTabs": false }`
- **Filed**: unrecorded
- **rsvelte**: `compatibility/fmt-oracle-excluded.json` entry
  `svelte/packages/svelte/tests/css/samples/unicode-identifier/input.svelte`

## Summary

In CSS, whitespace after a hexadecimal escape is the escape's **terminator** and is consumed by
it. `#\31 span` is therefore the single id selector `#1span`, while `#\31  span` — the same text
with one more space — is the *descendant* selector `#1 span`. `oxfmt --svelte` rewrites the
second as the first, so two selectors that select different elements come out as the same text.

Svelte's own fixture is built to tell them apart: it colours the id selector `red` and the
descendant selector `green`.

## Input

`submodules/svelte/packages/svelte/tests/css/samples/unicode-identifier/input.svelte`, lines
28-30 (three selectors, of which the last is a descendant):

```css
	#\31span { color: red; }
	#\31 span { color: red; }
	#\31  span { color: green; }
```

## What oxfmt produces

```css
  #\31span {
  #\31 span {
  #\31 span {
```

The third selector has lost one space and is now byte-identical to the second.

## Why this is not cosmetic — the official Svelte compiler's own output

Compiling **both texts** with `submodules/svelte/packages/svelte/src/compiler/index.js`
(5.56.10, `{ generate: 'client', dev: false }`) and printing the emitted CSS:

```
--- the source ---
	#\31\32\33 .svelte-4hbqx4{ color: green; }
	#\31 23.svelte-4hbqx4 { color: green; }
	/* (unused) #\31span { color: red; }*/
	/* (unused) #\31 span { color: red; }*/
	#\31 .svelte-4hbqx4 span:where(.svelte-4hbqx4) { color: green; }   ← live, scoped

--- oxfmt's output ---
  #\31\32\33 .svelte-4hbqx4{
  #\31 23.svelte-4hbqx4 {
  /* (unused) #\31span {
  /* (unused) #\31 span {
  /* (unused) #\31 span {                                             ← pruned as unused
```

The rule that was **used and scoped** in the source is **pruned as unused** after formatting.
The element that was green renders unstyled. This is a behaviour change produced by a
formatter, on input the formatter accepts without a diagnostic.

## Reproduction

```sh
cp submodules/svelte/packages/svelte/tests/css/samples/unicode-identifier/input.svelte /tmp/probe/
npx oxfmt@0.64.0 /tmp/probe -c scripts/fixtures/fmt-corpus.oxfmtrc.json
grep -n '31' /tmp/probe/input.svelte
```

## Note on scope

The same file also shows a *cosmetic* divergence that the rsvelte entry originally recorded —
`oxfmt --svelte` emits one space before `{` after an escaped-unicode selector where its own
raw-CSS path emits two. That is a formatting choice. The escape-terminator collapse above is not.
