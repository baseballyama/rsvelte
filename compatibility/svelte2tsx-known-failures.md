# svelte2tsx-known-failures.json — why entries are accepted

The svelte2tsx output-parity corpus (`scripts/compat-corpus/svelte2tsx-*`) compares
rsvelte's svelte2tsx port against **official `svelte2tsx`** byte-for-byte (after
oxfmt normalization). The ratchet may only shrink.

**Current baseline: `svelte2tsx-known-failures.json`, 173 entries.**

Partition of `svelte2tsx-known-failures.json` by verdict: `168 + 5`

- **168 — the emitted TSX differs** (`ts-mismatch`).
- **5 — one side rejects and the other compiles** (`error-mismatch`): 3 where
  official compiles and rsvelte errors, 2 the other way round.

## Wave-2 enrolment (#3130)

The list was **0** before the enrolment and every one of the 173 comes from one
of the 67 new repositories — the 36 pre-existing sources still contribute zero,
which is the same positive control the compiler ratchets report. 28 repositories
contribute at least one; svelte-lexical (42), sveltekit (23) and
svelte-tweakpane-ui (17) are 47% of the list between them.

The clusters, keyed by the first differing line:

| n | class |
|---|---|
| 44 | rsvelte emits an **extra** `/*Ωignore_startΩ*/` region marker |
| 18 | rsvelte **omits** an `/*Ωignore_startΩ*/` marker official emits |
| 12 | `return { props: {` — rsvelte appends a JSDoc block official does not |
| 13 | `__sveltets_2_ensureType(String, Number, …)` — a text run's interior whitespace is collapsed |
| 9 | an `import {` official keeps is emitted as a bare `;` |
| 12 | a CSS selector inside a JSDoc comment (` * .demo {`) is truncated |
| 65 | a 51-cluster tail, most of it one entry each |

The two marker clusters are the single largest cause and are one question —
**where a `/*Ωignore_*Ω*/` region begins and ends** — not two. Nothing here is
an oracle bug: the `oracle-invalid` classification (94 entries this run) already
carries those, and it is a pass, not a ratchet entry.



- `pattern/issues/3200-asi-reactive-block.svelte` — **rsvelte is the worse side
  here, and the entry says so.** The file is a deliberately-unparseable repro
  (its point is the compiler's `js_parse_error` position inside a `$:` block),
  and when the instance script does not parse rsvelte's svelte2tsx skips every
  script transform: `export` is not blanked, the prop is missing from `props` /
  `bindings` / `__sveltets_2_partial`, and the `$:` block is not wrapped in
  `;() => { … }`. Official's transform is TypeScript-based and error-tolerant, so
  it still applies them. Tracked as
  [#3232](https://github.com/baseballyama/rsvelte/issues/3232); the entry exists
  because the two gates share one population — the repro has to be in the corpus
  for the compiler gate, and it cannot pass the svelte2tsx gate until #3232 is
  fixed.

The usual justified reason to add an entry is that **official svelte2tsx is buggy
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
