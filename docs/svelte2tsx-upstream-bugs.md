# svelte2tsx bugs blocking 100% corpus parity

The svelte2tsx output-parity corpus (`scripts/compat-corpus/svelte2tsx-*`) compares
rsvelte's svelte2tsx port against **official `svelte2tsx`** (the oracle) byte-for-byte.
After this burndown the only remaining in-scope failures are cases where **official
svelte2tsx is buggy and rsvelte is more correct** — matching the oracle would require
reproducing crashes, executing embedded scripts, emitting garbage/malformed TSX, or a
parser bug. These should be fixed **upstream** (sveltejs/language-tools), not mirrored
in rsvelte.

Corpus status: 41 → 12 known failures this session (29 fixed, 0 regressions). Of the 12,
4 are `destructured-props` awaiting [language-tools#3058](https://github.com/sveltejs/language-tools/pull/3058)
(an array-binding-hole crash already fixed upstream, pending release). The 8 below are
genuine svelte2tsx bugs.

## 1. `</script   >` / `</style   >` (whitespace before `>`) not recognised

Fixtures: `parser-legacy/{whitespace-after-script-tag,whitespace-after-style-tag}`

```svelte
<script>
	let name = 'world';
</script     >          <!-- whitespace before > -->
<h1>Hello {name}!</h1>
```

svelte's own parser accepts this (it's a passing `parser-legacy` fixture), but
svelte2tsx's htmlx extraction regex only matches `</script>` / `</style>` with no
trailing whitespace, so it fails to extract the instance script / component style and
mis-emits the `<script>`/`<style>` as a template element (invalid TSX). rsvelte extracts
them correctly.

## 2. `<script>`/`</script>` embedded in an attribute value is executed

Fixtures: `runtime-legacy/escaped-attr`, `runtime-legacy/textarea-value-escape`

```svelte
<noscript>
	<a href="</noscript><script>console.log('should not run')</script>">test</a>
</noscript>
```

svelte2tsx parses the **attribute string** as markup, "closes" the noscript, and extracts
the embedded `<script>` — emitting `console.log("should not run");` as a top-level
statement (and truncating `href` to `` `</noscript>` ``). `textarea-value-escape` is the
same via a `value={`…<script>alert('BIM')</script>`}` template literal → `alert("BIM");`.
This is a parser bug (attribute values are not markup). rsvelte keeps the value as a string.

## 3. Crash on a valid `{#await … then x}` that shadows a top-level binding

Fixture: `snapshot/await-block-scope`

```svelte
<script>
	let counter = $state({ count: 0 });
	const promise = $derived(Promise.resolve(counter));
</script>
{#await promise then counter}{/await}
{counter.count}
```

This is a **valid** component (both svelte and rsvelte compile it; it has snapshot
`_expected/` output). official svelte2tsx throws `Cannot overwrite across a split point`
(a MagicString range conflict when relocating the shadowing `then` binding). rsvelte
produces valid TSX.

## 4. Garbage element name from table auto-close

Fixture: `runtime-xhtml/autoclosed-tags`

```svelte
<table><thead><tbody><tfoot><tbody><tr><td><th></tr><tr></table>
```

official's auto-close emits `svelteHTML.createElement("}tr", {})` — a `}` leaks into the
tag name. rsvelte auto-closes the table elements correctly.

## 5. `{@const}` migrated to malformed `const st x = …`

Fixture: `migrate/remove-blocks-whitespace`

```svelte
{   @const x = 43   }
```

official emits `const st x = 43   ;` (a stray `st` from a mis-aligned overwrite of
`{   @const`). Invalid TS. rsvelte emits `const x = 43;`.

## 6. `migrate/svelte-component` raw/whitespace artifacts

Fixture: `migrate/svelte-component/input`

Adversarial Svelte-4 migrate input; official emits raw, oxfmt-unparseable output with
inconsistent spacing (e.g. `props: {  }` for an attribute-less `<svelte:component>`,
`} Component}` close spacing). 564-line raw-byte divergence.

---

### Recommendation

Fix these in sveltejs/language-tools (svelte2tsx). Until then they are tracked in
`compat/corpus/svelte2tsx-known-failures.json` and should NOT be mirrored in rsvelte —
doing so would regress rsvelte's (correct) output to match the oracle's bugs.
