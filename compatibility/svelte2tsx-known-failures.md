# svelte2tsx-known-failures.json — why entries are accepted

The svelte2tsx output-parity corpus (`scripts/compat-corpus/svelte2tsx-*`) compares
rsvelte's svelte2tsx port against **official `svelte2tsx`** byte-for-byte (after
oxfmt normalization). The ratchet may only shrink.

**Current baseline: `svelte2tsx-known-failures.json`, 70 entries.**

Partition of `svelte2tsx-known-failures.json` by verdict: `68 + 2`

- **68 — the emitted TSX differs** (`ts-mismatch`).
- **2 — one side rejects and the other compiles** (`error-mismatch`).

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

The drop from 125 to 123 removes `chatgpt-web`'s `Home.svelte` and immich's
`VideoNativeViewer.svelte`, which the Linux full-corpus run measured as passing
after the parser fix.

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

**Read that table as five buckets, not as five causes, and the reason is the key.**
`svelte2tsx-cluster.mjs:24` keys a cluster on `diffSignature` — the **first differing line**
after blank-line normalization. A first differing line names a *symptom*, and for a whole class
of defect it does not preserve the cause: a parser- or emitter-state leak surfaces at whichever
later construct happens to be affected, so one cause scatters across several signatures while two
unrelated causes with the same line shape fold into one. The row above where 42 and 8 are
hand-annotated as "one question" is that failure mode caught after the fact, not a property of
the key. The same key produced a wrong summary for the SCSS gate on 2026-08-30 — the divergence
there was written up from its first differing line as a `:not()`-selector rule and is actually a
parser-state leak that reaches every later slash list in the file — so treat this partition as a
starting hypothesis and re-derive the cause from the mechanism before sizing any work off it.

**And one number in it is a question that has not been asked.** The largest cluster is 42, and
`svelte-lexical` contributes exactly 42 of the 123 entries. Whether those are the same 42 decides
what the cluster means: one repository's one pattern (a single fix, and the "largest cause"
framing is an artifact of which repositories were enrolled) or a coincidence between an
emitter-wide defect and an unrelated concentration. The per-entry class is not stored anywhere —
`svelte2tsx-cluster.mjs` reads `compatibility/report-s2t.json`, which is regenerated per run and
not checked in — so answering it needs a corpus run, not a re-reading of this file. The
distribution over sources IS derivable from the ratchet and is: `svelte-lexical` 42,
`svelte-gantt` 10, `sveltekit` 8, `trakt-web` 7, `primo` 6, `svelte-inspect-value` 6, then 18
sources with 1–5 each, 24 in total.

Whoever picks this up should also read the Linux caveat above as a constraint on *what they can
measure*, not only on what they can commit: a local macOS run reports a different set, so it can
produce a classification but not a count.

## The 42-vs-42 question is answered, and the cluster is one question about `$name`

Measured 2026-08-31 on the 123 listed ids by running both implementations directly with the
options `svelte2tsx-compile.mjs` passes (`{filename, isTsFile, mode:'ts', namespace:'html',
version:'5'}`) and taking the first differing line after blank-line normalization. The bucket
sizes reproduce this file's own table exactly — 42 extra-marker, 8 missing-marker, 16
`ensureType` — which is the evidence that the *classification* is stable even though a macOS run
cannot be trusted for a count.

**They are not the same 42.** `svelte-lexical` contributes 42 entries and the extra-marker cluster
holds 42, but the intersection is **36**: six `svelte-lexical` entries are in the tail, and the
cluster's other six come from `svelte-inspect-value` (4), `sveltekit` (1) and `trakt-web` (1). So
it is neither one repository's pattern nor a coincidence — it is an emitter-wide defect that one
repository concentrates.

**And the marker is a symptom, not the cause.** In 41 of the 42, rsvelte emits a
`let $<name> = __sveltets_2_store_get(<name>);` declaration — inside the `/*Ωignore_startΩ*/`
region, which is why the region marker is what the first differing line shows — and **official
emits no `__sveltets_2_store_get` at all** in the same file. The question is therefore *when does
`$name` become a store subscription*, one level below the marker. Splitting the 41 by whether the
component is in runes mode and by where the `$name` text actually occurs:

| n | component | where `$name` occurs | example |
|---|---|---|---|
| 28 | runes | in code | `svelte-lexical/…/TypeAheadMenu.svelte` — `$getSelection`, `$isRangeSelection` imported from `lexical` |
| 9 | legacy | in code | `svelte-lexical/…/FontSizeDropDown.svelte` — same names, legacy component |
| 4 | runes | **only inside a string literal** | `svelte-inspect-value/…/+layout.svelte` — the only `$types` in the file is `from './$types.js'` |

The four string-literal cases are a scan reading a quoted import path, which the *compiler's* copy
of this decision already excludes (`2_analyze/store_subscriptions.rs` skips object keys, member
properties, string literals and comments). A fifth file, `trakt-web/…/Switch.svelte`, has its only
`$color` inside a `<style lang="scss">` block, where it is an SCSS variable. So this is another
instance of [`two-ports-inventory.md`](two-ports-inventory.md)'s shape: the svelte2tsx port carries
its own answer to a question the compiler already answers, and no gate compares the two.

The runes rows are the larger half and the same family as #3127/#3128: in runes mode `$name` is
never a store subscription, and 32 of the 41 are components official reads as runes.



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

### 2026-08-31 — one space, 90 files, and a gate that cannot see any of them

`ExportedNames.ts:476` writes the combined SvelteKit block as
`` `${kitType};${name} = __sveltets_2_any(${name});` `` — `kitType` already carries
its leading `: `, so the separator between the annotation and the widener is a
bare `;`. rsvelte spelled the same string as one format literal and put a space
after that `;`. Fixed.

The measurement is the point. Over all 33,776 corpus components, comparing the
**raw** `svelte2tsx` text of three implementations:

| | ids |
|---|---|
| output changed | 96 |
| …now byte-identical to official | **90** |
| …**regressed** | **0** |
| …differ from official before and after | 6 |

**86 of those 90 were not in this ratchet**, which is the finding: the gate
normalizes both trees with `oxfmt` before comparing (`svelte2tsx-verify.mjs:218`),
and oxfmt reprints `; data` and `;data` identically. So this divergence was
present in 90 real files and *structurally invisible* to the gate — no corpus size
reaches it, because the normalizer, not the population, is what hides it. The
other 6 carry a further raw difference that normalization also absorbs, and
re-running the gate's own normalization over all 96 confirms 0 gate-visible
regressions.

Recorded so the next person does not read a green gate as "the text agrees":
what this gate compares is the text *after* oxfmt, and whitespace inside a
statement is below its resolution.

### 2026-08-31 — a `lang="ts"` script never reads the JSDoc above its `$props()`

Upstream reaches its whole JSDoc scan under `if (!this.isTsFile)`
(`ExportedNames.ts:242`), so in a TS file the `/** @type {Props} */` above a
`$props()` destructuring is never consulted and `createPropsStr` runs, emitting
`;type $$ComponentProps = { … };`. rsvelte read `jsdoc_type` regardless of the
language, took the JS branch, and emitted **nothing** — so the props return type
loses the author's shape entirely.

Corpus differential over all 33,776 components: **4 outputs change, 4 become
byte-identical to official, 0 regress**, and all four are ratchet entries.
Re-running the gate's own normalization over the 70 ratchet ids moves the
already-matching count 30 → 34 with 0 gate-visible regressions.

The control is the same source as JavaScript: it must keep the JSDoc and emit no
alias. Both arms are pinned in
`crates/rsvelte_projection/tests/svelte2tsx_ts_props_ignores_jsdoc.rs`; dropping
the `!is_ts` guard turns the TS arm red and leaves the JS arm green.
