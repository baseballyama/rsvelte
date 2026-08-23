# Svelte's `parse(source, { loose: true })` crashes on two malformed documents instead of recovering

The official Svelte compiler (v5.56.9) kills `parse()` with a non-Svelte error — no error code, no
position, no frame — on two inputs, *even though `loose: true` is the mode that exists to return an
AST for a document that is still being typed*.

```js
import { parse } from 'svelte/compiler';

parse('<div class="a>text</div>', { modern: true, loose: true });
// Error: An impossible situation occurred

parse('</div>', { modern: true, loose: true });
// TypeError: Cannot read properties of undefined (reading 'name')
```

Both are internal errors rather than diagnostics, and `loose` is what makes them reachable: with
`loose: false` each of these inputs produces a proper Svelte diagnostic.

| source | `loose: false` | `loose: true` |
|---|---|---|
| `<div><b>x` | `element_unclosed` | AST |
| `{#if a}<b>x</b>` | `block_unclosed` | AST |
| `<b>{ }</b>` | `js_parse_error` | AST |
| `<script>let a = 1;` | `element_unclosed` | `element_unclosed` |
| `<div class="a>text</div>` | `unexpected_eof` | **`Error: An impossible situation occurred`** |
| `</div>` | `element_invalid_closing_tag` | **`TypeError: … reading 'name'`** |

The `<script>` row is the useful control: `loose` is deliberately not blanket recovery, and
returning a diagnostic there is a choice. The two bold rows are not that — `loose` turns a
diagnostic into a crash.

An unclosed attribute quote is close to the most common transient state an editor integration can
observe: every keystroke between typing the opening quote and the closing one produces that
document.

## Where they come from

**`</div>` — `phases/1-parse/state/element.js:94`.**

```js
// close any elements that don't have their own closing tags, e.g. <div><p></div>
while (/** @type {AST.RegularElement} */ (parent).name !== name) {
	if (parser.loose) { ... }
```

`parent` is `parser.stack.at(-1)`. On a stray closing tag the stack has already been unwound past
the root, so `parent` is `undefined` and `.name` throws before the `parser.loose` branch inside the
loop is ever reached. The recovery code is one line too late.

**`<div class="a>text</div>` — `phases/1-parse/state/element.js:946` via `compiler/state.js:61`.**

```js
// element.js, read_tag()
loc: { start: locator(start), end: locator(end) }
```

```js
// state.js
locator = (i) => {
	const loc = l(i);
	if (!loc) throw new Error('An impossible situation occurred');
	return loc;
};
```

In loose mode the unterminated quote lets `read_tag` run off the end of the source, so `end` is an
index `getLocator` cannot resolve and `locator` raises its own guard. The message is accurate about
the invariant and useless to the caller: the *reachable* situation is a `loose` parse whose index
has passed `source.length`.

## How it was found

rsvelte gates its public `parse()` against upstream's over a 14,102-component corpus plus a small
hand-written `loose` set (`scripts/compat-corpus/parse-ast-verify.mjs`). rsvelte returns an AST for
the first of these two, so it surfaces as a divergence. It is recorded on rsvelte's side because
byte-parity is the goal, but reproducing an internal error is not something a port should do.
