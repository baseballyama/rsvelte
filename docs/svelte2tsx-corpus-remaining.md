# svelte2tsx corpus — remaining divergences

The svelte2tsx output-parity corpus compares rsvelte's `svelte2tsx` port against
the **official** `svelte2tsx` over every shipped component, requiring
byte-identical TSX after oxfmt normalization.

This PR burned the baseline **124 → 0** (a full pass), and added an
`oracle-invalid` classification that correctly passes entries where the official
tool itself produces broken output (see below).

## `oracle-invalid` — the official oracle is broken (now PASS)

An output-parity oracle is only meaningful when the official tool produced valid
output. On a few degenerate inputs official `svelte2tsx` either **crashes** (an
internal MagicString error) or emits **unparseable TSX**. There is no valid
target to match and rsvelte's own output is valid, so the verify
(`scripts/compat-corpus/svelte2tsx-verify.mjs`) classifies these `oracle-invalid`
(a pass) — ONLY when the official side is broken AND rsvelte's side is valid
(oxfmt-parseable). This never masks a real rsvelte bug.

- `snapshot/await-block-scope` — official crashes (`Cannot overwrite across a
  split point`) when `{#await p then x}` shadows an outer `x`.
- `runtime-xhtml/autoclosed-tags` — official emits an unparseable `}tr`
  MagicString artifact.
- `migrate/remove-blocks-whitespace`, `migrate/svelte-component` — official emits
  unparseable TSX on these Svelte-4 migrate inputs (e.g. `const st x`).

rsvelte was fixed to emit *valid* TSX for the await-empty-then and
`<svelte:component>`-event-bubbling cases so they qualify.

## Previously-divergent, now fixed — `</noscript>` / `</textarea>` inside an attribute value

- `runtime-legacy/escaped-attr` — `<a href="</noscript>…<script>…</script>">`.
- `runtime-legacy/textarea-value-escape` — `<textarea value={`…</textarea>…`} />`.

Official applies HTML **rawtext** semantics via a regex pre-pass: `</noscript>` /
`</textarea>` closes the rawtext element, so the attribute value truncates there
and the trailing `<script>` is re-extracted as a module statement. These now
match: rsvelte re-extracts the attribute-embedded `<script>` via the
**attribute-value-scoped** `find_orphan_scripts` walk (NOT a source-wide scan —
an earlier source-wide attempt over-matched real `<script>` elements in
`<svelte:head>` / `{@html}` / nested templates and regressed 11 files, so it was
reverted in favour of the scoped walk).

---

**CI status:** the corpus gate (`corpus-compat.yml`) ratchets this baseline — it
fails only on a *regression* (a file outside the baseline newly diverging). The
baseline may only shrink.
