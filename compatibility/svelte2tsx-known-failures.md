# svelte2tsx-known-failures.json — why entries are accepted

The svelte2tsx output-parity corpus (`scripts/compat-corpus/svelte2tsx-*`) compares
rsvelte's svelte2tsx port against **official `svelte2tsx`** byte-for-byte (after
oxfmt normalization). The ratchet may only shrink.

**Current baseline: `svelte2tsx-known-failures.json`, 125 entries.**

Partition of `svelte2tsx-known-failures.json` by verdict: `121 + 4`

- **121 — the emitted TSX differs** (`ts-mismatch`).
- **4 — one side rejects and the other compiles** (`error-mismatch`).

## Wave-2 enrolment (#3130)

The list was **0** before the enrolment and all 139 entries come from one of the
67 new repositories. The 37 pre-existing *real-world* sources still contribute
zero, which is the same positive control the compiler ratchets report.
26 repositories contribute at least one; svelte-lexical (42) and
svelte-gantt (10) are the two largest contributors.

**The first baseline was 173 and was written from a macOS run; Linux CI reports
the set this file carries.** The 15 it dropped are 14 tiny
`sveltekit/packages/package/test/fixtures/…` components plus one carbon fixture,
all `ts-mismatch`, all passing on Linux — the two-sided ratchet is what surfaced
them. That platform split is **still live**: re-measuring on macOS after the
rebase reports those same 15 as NEW failures, which is the positive control that
the file here is the Linux set and not a local one. Read it as the same caveat
`fmt-known-failures.md` states for its own gate: **shrink this ratchet from a
Linux `corpus-compat.yml` run, not locally.**

The drop from 158 to 139 is the rebase onto `main` plus the fix for
`pattern/issues/3200-asi-reactive-block.svelte`: re-measuring removed **19
entries that already passed**, and the fix removed one more.

The drop from 139 to 125 removes 14 entries that the Linux full-corpus run
measured as passing after the import-preservation fixes: 13 from
svelte-tweakpane-ui and sveltepress's `GlobalLayout.svelte`.

The `ts-mismatch` clusters, keyed mechanically by the first differing line
(the classifier is the one in this file's history, not a hand review — it asks
what the differing line contains, in this order):

| n | class |
|---|---|
| 42 | rsvelte emits an **extra** `/*Ωignore_startΩ*/` region marker |
| 8 | rsvelte **omits** an `/*Ωignore_startΩ*/` marker official emits |
| 16 | `__sveltets_2_ensureType(String, Number, …)` — a text run's interior whitespace is collapsed |
| 17 | a CSS selector inside a JSDoc comment (` * .demo {`) is truncated |
| 38 | a tail, most of it one entry each |

The two marker clusters are the single largest cause and are one question —
**where a `/*Ωignore_*Ω*/` region begins and ends** — not two. Nothing here is
an oracle bug: the `oracle-invalid` classification (94 entries this run) already
carries those, and it is a pass, not a ratchet entry.



The former `pattern/issues/3200-asi-reactive-block.svelte` entry was removed when
[#3232](https://github.com/baseballyama/rsvelte/issues/3232) was fixed. The file is
a deliberately-unparseable compiler repro, but svelte2tsx now repairs its missing
ASI before re-parsing and applies the same script transforms as official.

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
