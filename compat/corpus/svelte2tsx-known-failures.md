# svelte2tsx-known-failures.json — why entries are accepted

The svelte2tsx output-parity corpus (`scripts/compat-corpus/svelte2tsx-*`) compares
rsvelte's svelte2tsx port against **official `svelte2tsx`** byte-for-byte (after
oxfmt normalization). The ratchet may only shrink.

**Current baseline: empty (`[]`)** — full parity, no tracked divergences.

The only justified reason to add an entry is that **official svelte2tsx is buggy
and rsvelte is more correct** — matching the oracle would require reproducing a
crash, executing embedded scripts, or emitting malformed TSX. Such cases should be
fixed **upstream** (`sveltejs/language-tools`), never mirrored in rsvelte (that
would regress rsvelte's correct output). The verify script
(`scripts/compat-corpus/svelte2tsx-verify.mjs`) classifies these `oracle-invalid`
(a pass) only when the official side is broken AND rsvelte's side is valid
(oxfmt-parseable), so it never masks a real rsvelte bug.

Known upstream svelte2tsx bug classes (reference, should any resurface):

- **`</script  >` / `</style  >` (whitespace before `>`) not recognised.** The htmlx
  extraction regex requires no trailing whitespace, so the script/style is mis-emitted
  as a template element (invalid TSX). rsvelte extracts it correctly.
- **`<script>` inside an attribute value is executed.** Attribute strings are parsed
  as markup, so an embedded `<script>` (e.g. `href="</noscript><script>…</script>"`)
  is re-extracted as a top-level statement. Attribute values are not markup.
- **Crash on a valid `{#await p then x}` that shadows a top-level binding** — official
  throws `Cannot overwrite across a split point` (a MagicString range conflict); the
  component is valid and rsvelte produces valid TSX.
- **Garbage from table auto-close** — official leaks a `}` into a tag name
  (`createElement("}tr", …)`).
- **Malformed migrate output** — Svelte-4 migrate inputs produce unparseable TSX
  (e.g. `const st x = …`, inconsistent `props: {  }` spacing).
