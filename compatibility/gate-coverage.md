# Gate coverage — what each gate cannot see

Every gate in this repo can be green while a real defect ships, because every gate has a
population it does not sample, a field it does not read, or a normalization step that erases
the divergence before the comparison happens. Those blind spots were undocumented and were
being rediscovered one shipped bug at a time. This file is the inventory.

It answers three questions per gate:

1. **What it compares** — the unit that actually gets diffed.
2. **What it structurally cannot observe**, and the specific flag / field / normalization
   step / population filter responsible.
3. **The evidence**, which is one of exactly three things:
   - **[D] discriminating case** — a concrete input for which the gate is green and a correct
     gate would be red. The strongest form, and the only one that separates "cannot see it"
     from "I did not find an example".
   - **[S] structural argument from code** — this flag is never passed / this field is never
     read / this population never contains X, with file and line.
   - **[U] unmeasured** — no evidence was gathered. A row marked `[U]` is a *question*, not a
     finding.

**Do not fill a row with a plausible guess.** An unsupported blind-spot claim is worse than a
blank, because the next person reads the row as surveyed and never looks again. If you have
neither a discriminating case nor a code citation, write `[U]`.

Line numbers are as of the commit that added or last revised the row. Code moves; when a
citation no longer resolves, re-derive the claim rather than deleting it.

---

## Reading the corpus in one sentence

The collected corpus samples the *marginal* distribution of published Svelte code. That is
the axis that is saturated. The two axes that still find defects are **what we compare**
(fields, not files) and **how inputs are constructed** (generated products, not collected
samples) — see `AGENTS.md` § "Generated shape matrix" and issue #2281.

---

## Summary

| # | Gate | Unit compared | Sharpest blind spot | Ev. |
|---|------|---------------|---------------------|-----|
| 1 | Compiler output parity (`verify.mjs`) | per-entry × per-target JS text + CSS text | comments, on every entry and every target | [D] |
| 2 | Compiler warning codes | multiset of `code` per entry × target | warning **message text** (#2403) | [S] |
| 3 | Compiler warning positions | multiset of `code@line:col` | warning **end** span | [S] |
| 4 | Compiler **error** parity | `error.json` `code`, `message`, `start` | error **`end`** and `frame` — never captured | [D] |
| 5 | Generated shape matrix | per-case × target JS text, or error `code` where official rejects | CSS; warnings; error **message** and **position**; most template positions | [S] |
| 6 | svelte2tsx TSX text parity | per-component TSX text, oxfmt-normalized | `exportedNames` / `events`; TSX line+column layout | [S] |
| 7 | svelte2tsx source map | structural invariants on rsvelte's own map | map **coverage** — a 1-of-1000-line map is valid | [D] |
| 8 | css-prune sweep | `css.code` + `code@line:col` warnings of 1430 generated components | `js.code`; **an empty population exits 0** | [D] |
| 9 | Formatter parity (JS corpus) | whole-file bytes vs oxfmt oracle | ids whose oracle file is absent are skipped, uncounted | [D] |
| 10 | Formatter parity (Rust svelte.dev) | whole-file bytes vs generated fixture | exercises `--no-native-css`, not the shipped default | [S] |
| 11 | Lint output parity | set of `rule\tline:col\tmessage` | `.svelte.(js\|ts)` ungated on **both** sides; autofixes never compared | [D] |
| 12 | svelte-check Layer 1 (fixtures) | multiset of `SEVERITY file:line code` | column, message, `source`, file-walk counts | [S] |
| 13 | svelte-check Layer 2 (e2e) | same key, 3 units in 2 repos | same fields; whether the oracle finds anything at all | [U] |
| 14 | Compiler source-map gate | 23 anchors + budgets + parity vs official | segments rsvelte **adds**; `sources`/`names`; `dev: true` | [S] |
| 15 | `ast_gate_preconditions` | "rsvelte's own output parses" | compile **failures** are skipped — errors make it greener | [S] |
| 16 | Validator fixture suite | per-fixture error code / warning set | ratchet staleness is **not** asserted (207 entries) | [S] |
| 17 | svelte2tsx fixture suite | per-fixture TSX text | text after the `export default class` cut is dropped from both sides | [S] |
| 18 | Compatibility report (`AGENTS.md` numbers) | pass/fail per fixture | warnings compared by **count only** | [S] |
| 19 | Output parseability (`verify.mjs`) | rsvelte's `js.code` alone, parsed with acorn | says nothing about whether the output is *right*; no CSS, no maps | [S] |
| 20 | Corpus-seeded mutation fuzz | per-mutant × target JS text, normalized as gate 1 | the operator only **inserts comments** — a delimiter in a *string* is unreachable at any corpus size | [D] |

Cross-cutting blind spots (path filters, ratchet-doc drift, vacuity floors, the **performance**
gates' population, and **an uninitialised corpus source shrinking every corpus gate silently**)
are in [§ Cross-cutting](#cross-cutting) at the end.

---

## 1. Compiler output parity — `scripts/compat-corpus/verify.mjs`

**Unit.** For each of ~14,025 manifest entries × 3 targets (`client`, `server`, `client-dev`,
`targets.mjs:21-51`): the generated JS text, blank-line-stripped (`verify.mjs:289-290`),
template-hole-flattened and oxfmt-normalized (`verify.mjs:247-257`). Where bytes differ, the
verdict comes from the Rust comparator `ast_equiv_batch` (`verify.mjs:301-316`). CSS is
compared byte-exactly, and only for targets with `css: true` (`verify.mjs:367-374`).

### Blind spot 1a — comments, on 100% of the corpus

`verify.mjs:310` invokes the comparator with **empty argv**:

```js
const out = execFileSync(AST_EQUIV_BIN, [], { ... });
```

`ast_equiv_batch.rs:54-56` selects `CommentPolicy::Ignore` in the *absence* of `--comments`,
so the binary's effective default inverts the library default (`ast_equiv/src/lib.rs:42-43`,
`Meaningful`). Under `Ignore` the comment vector is empty (`lib.rs:161-173`) and annotation
printing is off (`lib.rs:186`), so `/* @__PURE__ */` stops being a code difference too.

Because `verify.mjs:292` byte-compares first and only defers *byte-different* pairs to the
comparator, a divergence living **only** in comments is byte-different, AST-equivalent, and
scored a pass — for every entry, on every target.

**Evidence [D].** `flowbite-svelte/src/lib/utils/singleselection.svelte.js` differs by hand
(official drops a `@type {symbol}` JSDoc, rsvelte keeps it) while `known-failures.client.json`
does not list it. Positive control: `command grep -rna -- "--comments"` across `scripts/`,
`.github/`, `package.json`, `crates/` returns two hits, both inside `ast_equiv_batch.rs`
itself. No caller passes it.

**Second, narrower cause.** `compile.mjs:76-83` `prepareSource` runs `.svelte.ts` entries
through `esbuild.transformSync({loader:'ts'})`, which drops every non-legal comment before
either compiler sees the file — 299 of 437 module entries (#2424). Verified locally:
`transformSync("// c\nexport let x = 1; /* b */\n//! legal\n")` returns
`"export let x = 1;\n//! legal\n"`. This is the *narrower* cause; fixing it alone buys zero
observability while 1a stands.

**Tracked:** #2424, PR #2436. **Closing it** requires rsvelte preserving comments *plus*
`--comments` here — a compiler change, not a harness one. Note that even
`CommentPolicy::Meaningful` filters JSDoc `@type` as prose (`lib.rs:259-269`), so flipping the
flag does not close the flowbite case.

### Blind spot 1b — comment ordering, not position

`ast_equiv/src/lib.rs:234` compares comments as an ordered `Vec<String>`. A meaningful comment
that moves within the file with no other change is equivalent. **[S]**, and moot today
because 1a means no gate reaches this code path with `Meaningful`.

### Blind spot 1c — everything the compiler returns except `js.code`, `css.code`, `warnings`

`compile.mjs:106-110` builds the recorded result from exactly three fields. **Discarded:**
`result.js.map`, `result.css.map`, `result.metadata` (including the `runes` flag),
`result.ast`. **[S]** A `metadata.runes` regression produces zero corpus signal.

### Blind spot 1d — the compile-option surface is one point

`compile.mjs:99-100`: `{ generate, dev, filename }` plus `css: 'external'` for components.
Never passed anywhere in the corpus pipeline: `runes`, `namespace`, `accessors`,
`customElement`, `preserveWhitespace`, `preserveComments`, `hmr`, `discloseVersion`,
`sourcemap`, `modernAst`. **[S]** Also `server` + `dev: true` is not a target
(`targets.mjs:21-51`), so SSR dev codegen is compared by no gate in the repo.

**Closing it:** each additional option roughly multiplies compile time and the ~0.19 GiB/target
artifact cost. `preserveComments` is the cheapest and highest-value one (it would make 1a
observable without a compiler change). Cost: unknown until measured.

---

## 2-3. Compiler warning parity — codes and positions

**Unit.** `compile.mjs:121-134` reduces each warning to `{code, line, column}` taken from
`w.start`. `verify.mjs:393` bags codes; `verify.mjs:394` keys positions as
`` `${code}@${line}:${column}` ``. Two independent shrink-only ratchets per target.

### Blind spot 2a — warning message text

`normalizeWarnings` (`compile.mjs:121-134`) never reads `w.message`. **[S]** The comment at
`compile.mjs:117-119` states this as a deliberate contract ("it is prose and upstream rewords
it"), but the consequence is that a warning whose message names the wrong attribute, the wrong
element, or the wrong suggested fix is invisible — e.g. #2413 (`a11y_invalid_attribute` names
`href` where the SVG attribute is `xlink:href`) and #2411 (`svelte_self_deprecated` suggests
the wrong-case path). Both are message-text defects on correct codes at correct positions.

**Tracked:** #2403. **Closing it:** record `w.message` in `warnings.json` and add a fourth
ratchet. The reason it was not done initially is that upstream rewords messages on minor
bumps, so the ratchet would churn — that cost is real but is a maintenance cost, not an
observability argument.

### Blind spot 2b — the warning `end` span

Only `w.start` is read (`compile.mjs:125-126`). **[S]** A warning with a correct start and a
wrong or absent end highlights the wrong range in an editor and is scored `match`.

### Blind spot 2c — warnings on entries either compiler rejects

`verify.mjs:418`: `if (expErr[target] || actErr[target]) continue;`. **[S]** Warnings emitted
alongside a compile error are never compared for that target.

---

## 4. Compiler error parity

**Unit.** Two independent comparisons. The *output* verdict compares `code` only (both sides
error → same code, else `error-mismatch`; one side errors → `error-mismatch`). Separately,
`verify.mjs`'s "error parity" section compares the first message line and `(line, column)` of
`start` for every `(id, target)` pair both sides reject with the same code, on two ratchets of
their own (`error-message-known-failures.<target>.json`,
`error-position-known-failures.<target>.json` — see
`compatibility/error-known-failures.md`).

Measured population, from the run that seeded those ratchets: 14,131 entries, 948 rejected by
both compilers, 2,843 `(id, target)` pairs with two errors to compare. Divergences by field:
`code` **0**, `message` **362 pairs / 121 ids**, `(line, column)` **1,209 pairs / 403 ids**.
The `code` column being saturated at 0 is why the two new columns were worth adding: no amount
of corpus growth could have moved a comparison that already agreed everywhere.

### Blind spot 4a — the error `end` span and `frame` are still never captured

`compile.mjs`'s `errorInfo` records `{ code, message, line, column }` — the `line`/`column` of
`start` only. Upstream highlights a **range**, and rsvelte's `end` is frequently `start + 1`
where `start` agrees: `attribute_duplicate` on `<div a="1" a="2">` reports `position: [11, 12]`
against upstream's `[11, 16]` (**[D]**, `crates/rsvelte_core/src/compiler/mod.rs`
`diagnostic_reports_code_message_and_span`). A wrong highlight *length* is invisible to this
gate. The rendered `frame` is likewise neither captured nor compared. **[D]**

### Blind spot 4b — a code-less error on either side degrades to error-parity

`verify.mjs` guards the output verdict with `e.code && a.code &&`. If either side's `code` is
`null`, no mismatch is recorded and the verdict falls through to `error-parity`.
`compile.mjs` leaves `code` `null` when the error object carries no `code` and the message
matches neither `svelte.dev/e/<code>` nor `code: "<code>"`.

Reachability is now measured rather than **[U]**: over the 2,843 both-reject pairs, a `null`
code occurs on **1** pair and on **0** pairs one-sidedly
(`svelte/packages/svelte/tests/migrate/samples/svelte-component/input.svelte`, where both
compilers raise an uncoded `Not implemented: LetDirective`). The guard has therefore never
degraded a real divergence in this corpus — and the message comparison covers that pair anyway,
since it treats two `null` codes as agreeing. **[D]**

### Blind spot 4c — entries only one side rejects have nothing to compare

The message/position comparisons skip any pair where one side compiles, or where the two codes
differ: the prose and span of two unrelated errors say nothing. Those pairs are
`error-mismatch` on the output ratchet, which sees the code and nothing else. **[S]**

---

## 5. Generated shape matrix — `scripts/compat-corpus/matrix/`

**Unit.** 1749 generated cases × 3 targets = 5247 comparisons. Where both compilers accept, the
unit is `js.code` only (`matrix/run.mjs:134,139,166-167`), oxfmt-normalized identically to
`verify.mjs`; where both reject it is the error **code** (`:150`), which the `invalid-bind` and
`param-default` families exist to exercise.

### Blind spot 5a — CLOSED: the module entry point is generated now

Originally: every case id hardcoded `.svelte`, so `compileModule` was never reached. Two
families now emit module cases — `comment-slot` through `COMMENT_MODULE_SEEDS`
(`generate.mjs:47-55`, `kind: 'module'`) and `param-default` through a `.svelte.js` twin of
every function form (`generate.mjs:112-116`) — and `run.mjs:124` dispatches on `kind`.
The entry point matters on its own: it is a different parse call in rsvelte, not a flag.

**Tracked:** #2425, closed. It was load-bearing while open: PR #2436 established that the matrix
is the *only* place a module comment divergence can be observed at all (cf. #2399).

### Blind spot 5b — CSS and warnings

`run.mjs:99` forces `css: 'external'` and `run.mjs:106,110` read `.js.code` only. `result.css`,
`result.warnings`, `result.metadata`, `result.js.map` are never accessed. **[S]**

Sharpest form: `axes.mjs:186` generates a `// svelte-ignore a11y_…` comment kind — the gate
injects svelte-ignore directives and then structurally cannot observe whether they suppress
anything.

### Blind spot 5c — template-markup positions, now partially covered

Every position in `axes.mjs`'s `POSITIONS` injects into a JS statement context inside the
instance `<script>` (or an inline handler body). The `literal-escape` family adds the first
markup axis — `EXPRESSION_SLOTS`, 14 slots: `{expr}`, an attribute value, `{@const}`, a handler
body, `{#if}` / `{#each}` / `{#await}` / `{#key}` heads, `{@html}`, `{@render}`, `class:` and
`style:` directives, a spread attribute, and an instance declaration.

It crosses those slots with **one** axis: how a string literal spells itself. Still
**unmeasured**: every other expression shape in those same slots, and the directive families
`use:` / `transition:` / `animate:` / `in:` / `out:`, which no slot here reaches. **[S]** Comment
insertion is likewise restricted to `<script>` bodies (`mutate.mjs:22-34`, `:48`), a deliberate
and documented exclusion (`mutate.mjs:9-13`) — so HTML comments `<!-- -->` are never mutated.

`param-default` adds two markup slots of its own (`PARAM_TEMPLATE_FORMS`: an event-handler
attribute and an `{expr}` interpolation) for a different reason — rsvelte parses a template
expression with a *different function* than a script body, so the two are separate code paths
and not merely separate positions. #2547's first fix was green on every script path while
`{(async (p = await x) => p)}` still compiled.

What the escape axis is for is worth stating, because the class is easy to dismiss as cosmetic:
these divergences produce output that **parses and computes the right value** and differs only
in text. The parse gate cannot see them, a runtime test cannot see them, and the only gate that
can is a byte comparison — which is why the axis had to be generated rather than collected: a
formatted repro file is not one, since the fmt oracle rewrites the very quote style that
distinguishes the failing shape from the working one.

### Blind spot 5d — both-reject cases discard the message and the position

`run.mjs:146-162` now compares the two error **codes** and reports `error-code-mismatch` when
they differ, so "both threw" no longer stands in for "both diagnosed the same thing". What it
still drops is everything else the error carries: the message prose and `start`. **[S]** rsvelte
can reject a shape with the right code, the wrong wording and an offset pointing at the wrong
token, and the case scores as parity. The collected-corpus gate does ratchet both
(`error-message-known-failures.*`, `error-position-known-failures.*`); this one does not, so a
shape only the matrix generates is unmeasured on both fields.

Note what closing the code half required: it is worth nothing without inputs that reach it, and
before family `invalid-bind` (`generate.mjs:73`) the only both-reject cases here were valid
programs that happened to break. **A comparison and a population have to be added together** —
either alone measures nothing.

### Blind spot 5e — accept-where-official-rejects has one input per code elsewhere

Families `invalid-bind` (`axes.mjs` — 20 invalid and 11 valid target expressions × 8 `bind:`
slots) and `param-default` (2 illegal and 5 legal parameter initializers × 5 positions in the
list × 9 function forms + 3 template forms × 2 entry points) are the *generated* population of
programs official rejects. Both halves are needed: the
invalid rows report "rsvelte accepts what official rejects", the valid rows report the reverse,
and neither can see the other's direction. The valid half exists because the first version of
this family had only the invalid one, and CI then caught an over-rejection
(`bind:group={c as T}`, a TypeScript assertion) from a **corpus file** rather than from the
gate — on the one slot that file happens to use. Everywhere else that question is
asked by the 145 `compiler-errors` fixtures, at **one input per code**, which makes a code with
a passing fixture read as covered. It is not: #2583 is `bind_invalid_expression` accepted on a
component while its fixture passed on an element. Three of the four accept-where-official-rejects
divergences known when this row was written sit on codes that have a passing fixture.

`param-default` is the same row for a *parser* rule rather than a validator, and it says
something the `bind:` family cannot: acorn enforces `checkYieldAwaitInDefaultParams` and OXC
implements no equivalent, so the divergence was not a missing port but a rule rsvelte never had.
Its legal rows are harder than `invalid-bind`'s, because the illegal and legal inputs differ only
in *whose* parameter list the keyword sits in —
`async (p = { async m() { return await 1; } }) => p` is legal, and a check that scans the
parameter subtree rejects it.

What remains **unmeasured**: every other error code, and every other acorn rule OXC does not
implement. These two families cross one validation and one parser rule with their slots. The
same drift is possible for any check written per call site rather than once — `{@render}`,
`use:`, `{#each … as}` patterns, `<svelte:element>` — and no gate here generates invalid inputs
for them.

**Closing 5b/5c:** the matrix runs in ~10 s on ~5,250 comparisons. Widening the markup axis (a
second expression axis against `EXPRESSION_SLOTS`) or reading `.warnings` is cheap relative to
every other gate here. This is the highest value-per-cost item in this document.

---

## 6. svelte2tsx TSX text parity

**Unit.** `expected-s2t/<id>/index.tsx` vs `actual-s2t/<id>/index.tsx`, both oxfmt-normalized
(`svelte2tsx-verify.mjs:124-130`) and blank-line-stripped (`:199-200`).

### Blind spot 6a — TSX line and column layout

The gate reformats both sides before comparing. **[S]** Every line and column in rsvelte's TSX
may differ from official's and the gate still reports `match`. This matters because the TSX is
what the language server position-maps into, and gate 7 validates rsvelte's map against
*rsvelte's own* line lengths — so no gate anywhere compares rsvelte's TSX positions to
official's. The header comment at `svelte2tsx-verify.mjs:9-13` claims token/comment parity is
part of the contract; the implementation runs a reformatter. Doc-vs-code gap.

### Blind spot 6b — `exportedNames` and `events`

`svelte2tsx-compile.mjs:116` returns `{ code, mappings }`. **[S]** The public result surface
(`apps/npm/svelte2tsx/index.d.ts:52-66`) also carries `exportedNames` and `events`, both
consumed by the language server, neither compared for any of the ~13.4k corpus components.
(Unit coverage exists in `crates/rsvelte_projection/tests/svelte2tsx_entry.rs`; corpus coverage
is zero.)

### Blind spot 6c — `kind: 'module'` entries are excluded

`svelte2tsx-compile.mjs:85-87` and `svelte2tsx-verify.mjs:79-81` both filter
`e.kind === 'component'`. **[S]** `.svelte.js` / `.svelte.ts` entries are outside this gate.

### Blind spot 6d — one option point

`svelte2tsx-compile.mjs:112`: `{ filename, isTsFile, mode: 'ts', namespace: 'html', version: '5' }`.
**[S]** `mode: 'dts'` (the `.d.ts` emit path), `namespace: 'svg'`, `namespace: 'mathml'`,
`accessors: true` and `version: '4'` are never exercised; `emitDts` is never called. Related:
#2438 (`namespace: 'foreign'` unreachable from the napi boundary).

### Blind spot 6e — `oracle-invalid` accepts anything, unratcheted

`svelte2tsx-verify.mjs:147-150`, `:188-190`, `:205-206`, excluded from `failures` at `:215`.
Two triggers, both of which accept rsvelte's output *whatever it contains* (including the empty
string, which oxfmt parses). **[S]** There is no `oracle-invalid` baseline, so the count can
grow without bound and no step fails.

---

## 7. svelte2tsx source map

**Unit.** `{ mappings, generatedLines }` from rsvelte's own map (`svelte2tsx-verify.mjs:98-101`).
This gate does **not** compare to official's map — that is deliberate and documented
(`sourcemap.mjs:6-18`, `svelte2tsx-verify.mjs:25-30`): the two maps are segmented too
differently to diff, so the gate asserts structural well-formedness and uses official only to
calibrate. Official's map serves as a *veto*: if it violates an invariant, the entry is
`map-oracle-invalid` and rsvelte's map is never examined (`:113-114`).

**The seven invariants** (`sourcemap.mjs:102-157`): decodable VLQ; no more mapping lines than
generated lines; generated columns sorted within a line; no 3+ "stalled copy run"; generated
column in bounds; original line in bounds; original column in bounds.

### Blind spot 7a — there is no coverage invariant

`extra-mapping-lines` (`sourcemap.mjs:113-115`) fires only when the map has *more* lines than
the text — one-directional. **[D]** Verified by running `mappingViolations` directly:
`mappings: "AAAA"` against **1000** generated lines returns `[]` (`map-valid`), as does
`mappings: ""`. A regression where rsvelte stops emitting segments after the `render()` opening
would misplace every `svelte-check` diagnostic in the template body and the gate reports
`map-valid` for all ~13.4k entries.

### Blind spot 7b — no correctness invariant relates generated text to mapped original text

**[D]** `"AAAA,IAAA,IAAA"` (everything maps to original 0:0) returns `[]`. So does
`"AAEA,IADA,IACA"` (generated line 0 maps to original lines 2, 1, 2 — scrambled). Only
*generated*-column monotonicity is enforced (`:124-126`); original positions may be arbitrary.

### Blind spot 7c — the #2066 defect class is only partially caught

`copy-run-stalled` (`:127-134`) requires original columns to advance by *exactly* +1. **[D]**
`"AAAA,AAAI,AAAI"` — all generated columns zero, original columns 0/4/8 (token granularity) —
returns `[]`. A token-granular regression to zeroed generated columns passes.

### Blind spot 7d — the `source` index is decoded and then discarded

`sourcemap.mjs:121` destructures with a hole: `const [column, , originalLine, originalColumn]`.
`map.sources` itself is dropped at `svelte2tsx-compile.mjs:136`. **[D]** `"ASAA"` (source index
9 against 1 source) returns `[]`.

**Tracked:** #2453. **Closing 7a:** a coverage floor (fraction of generated lines carrying ≥1 segment, calibrated
against official on the same corpus) is a ~20-line addition to `sourcemap.mjs` and would catch
the sharpest case. Cost: low.

---

## 8. css-prune sweep — `scripts/compat-corpus/css-prune-sweep.mjs`

**Unit.** 1430 generated components; `css.code` after hash normalization plus the sorted
`code@line:col` of every warning, compared by `css-prune-verdict.mjs`;
`generate: 'client'`, `dev: false`, `css: 'external'`.

### Blind spot 8a — an empty population exits 0

**[D] Verified locally:**

```
$ node scripts/compat-corpus/css-prune-sweep.mjs --list --filter ZZZNOMATCH
0 components
EXIT=0
```

There is no population floor anywhere in the file — `command grep -n "all.length\|MIN_\|EXPECTED_\|floor"`
returns one hit, `:482`, a `console.log`. With `--check`, an empty grid produces
`divergedIds = []` against a `[]` baseline, so `regressions` and `fixed` are both empty and
`:515-516` prints "no regressions" and exits 0. Gutting `SELECTORS_A/B/C/C3` is
indistinguishable from a clean sweep.

Positive control that this asymmetry is a real gap and not a house style: the sibling gates do
carry floors — `artifacts.mjs:79` (`MIN_FULL_CORPUS_ENTRIES = 12000`),
`svelte2tsx-verify.mjs:85-88` (`MIN_MANIFEST_ENTRIES = 1000`), `verify.mjs:204-210`,
`sourcemaps_gate.rs:1011-1028`.

### Blind spot 8b — `--both` cannot fail

`clientServerDiffs` is incremented (`:424`) and printed (`:485`); the exit path (`:495-517`)
reads only `divergedIds`. **[S]** And CI does not pass `--both` anyway
(`corpus-compat.yml:255`).

### Blind spot 8c — `warnings` discarded — CLOSED

`compileCss` returned `{ css }` only, so rsvelte could prune identically and omit the
`css_unused_selector` warning and still score green. It did: an outer rule whose enclosing
selector matched no ancestor pruned to a byte-identical `(empty)` stylesheet either way, so
the whole grid read 1430/1430 while 16 components diverged on warnings alone (#2474).

**[D] Verified locally** on the fixed compiler, by deleting one warning from the rsvelte side
of the comparison: with the `css.code`-only key the sweep still reported `matched: 1430,
diverged: 0`; with the warning key it reports `warning-mismatch`. The verdict now compares the
sorted `code@line:col` of every warning after the CSS compares equal, and
`scripts/dev/test-css-prune-sweep-warning-verdict.mjs` pins that (it fails on the previous
comparator, and also asserts the sweep still routes through it).

`js.code` is still discarded — the sweep is a phase-2 gate and the corpus pipeline compares JS
on real code, so this is deliberate rather than a gap.

**Tracked:** #2445. **Closing 8a:** one assertion. Cost: trivial.

---

## 9. Formatter parity — JS corpus (`fmt.mjs` + `fmt-verify.mjs`)

**Unit.** Whole-file byte equality against an oxfmt(`svelte: true`) oracle
(`fmt-verify.mjs:102`). No normalization — this is the one gate that compares raw bytes.
Population: manifest entries with `kind === 'component'` (`fmt.mjs:170`).

### Blind spot 9a — ids with no oracle file are skipped silently, and nothing counts

`fmt-verify.mjs:97`: `if (oracle === null) continue; // not part of the parity set`.
The only guard is `included.length < 1000` (`:69-76`), read from `meta.json` — **not** from the
number of comparisons actually performed. `matched` is printed (`:149`) and never asserted.

**[D]** CI restores the oracle from `actions/cache` (`corpus-compat.yml:317-323`, caching both
`compatibility/fmt/oracle` and `compatibility/fmt/meta.json`), and `fmt.mjs:184-191` declares
the oracle fresh on `fs.existsSync(ORACLE)` — existence of the *directory*, not of its
contents. A partially-restored oracle tree with an intact `meta.json` passes the `>= 1000`
guard, `continue`s past every id, and prints
`✅ all corpus components format identically to the oracle` having compared almost nothing.

### Blind spot 9b — `meta.skips` is unbounded

Files oxfmt rejects go to `meta.skips` (`fmt.mjs:229-241`) and never enter `included`.
`fmt-verify.mjs:137` records the count in the report and never checks it. **[S]** An oxfmt
upgrade that starts rejecting large swaths of the corpus stays green while `included >= 1000`.
Positive control that a ceiling is the house pattern where someone thought about it:
`crates/rsvelte_formatter/tests/svelte_dev_corpus.rs:337` (`MAX_UNPARSEABLE = 20`).

### Blind spot 9c — `kind: 'module'` excluded

`fmt.mjs:170`. **[S]** `.svelte.js` / `.svelte.ts` files are never formatted or compared here,
and neither are standalone `.css` / `.scss` / `.less` files.

**Note on exclusions:** `fmt-oracle-excluded.json` holds 22 entries, each with a written
justification (2 migrate, ~10 oracle-bug, 2 invalid-input, 4 oxc-vs-prettier layout, 1 platform
nondeterminism, 3 oxfmt-internal CSS disagreement). This is a *small, justified* set — noted
here so it is not mistaken for a blind spot. Its staleness check is `console.warn` only
(`fmt-verify.mjs:110-126`).

**Tracked:** #2447. **Closing 9a:** assert `matched + failures.length + excluded === included.length`. Cost: trivial.

---

## 10. Formatter parity — Rust svelte.dev corpus

**Unit.** `rsvelte_formatter::format(&input, &opts)` vs a generated `expected.svelte`
(`svelte_dev_corpus.rs:289-290`), over real `.svelte` files and ```svelte markdown fences from
`submodules/svelte.dev`.

### Blind spot 10a — it exercises the non-default CSS path

`svelte_dev_corpus.rs:100-102` claims its style callback "mirrors the production one" and pipes
each `<style>` body through an `oxfmt` subprocess (`:127-152`). **[S]** In shipped
`rsvelte-fmt` that function is reached **only** under `--no-native-css`
(`crates/rsvelte_fmt/src/options.rs:154-157`); the default is the in-process
`rsvelte_formatter::native_style_formatter`. The comment asserting production parity is stale.
Consequence: the default native CSS engine's parity with oxfmt is measured only by gate 9's
whole-file compare, and `crates/rsvelte_formatter/tests/css_native.rs` is 5 hand-written
`assert_eq!`s against literal strings, not a parity gate.

### Blind spot 10b — `Err(_)` from `format` does not fail the test

`svelte_dev_corpus.rs:300-303` routes errors to `unparseable`, bounded only by
`MAX_UNPARSEABLE = 20` (`:337-343`). **[S]** A sample flipping from *formatted correctly* to
*unparseable* is a pass.

**Vacuity, for the record:** this gate has the best-defended skip conditions in the repo — every
early `return` is guarded by `assert!(!in_corpus_job())` (`:71-74`) and CI sets both required
env vars (`ci.yml:610,615`), plus `:262` asserts the sample list is non-empty. Use it as the
model when adding floors elsewhere.

---

## 11. Lint output parity — `lint-verify.mjs`

**Unit.** Per file, a **Set** of `` `${ruleId}\t${line}:${col}\t${message}` `` (`:90`). This is
the only gate in the repo that *does* compare message text.

### Blind spot 11a — `.svelte.js` / `.svelte.ts` are outside the gate on *both* sides

`lint-verify.mjs:84` filters the manifest to `kind === 'component'`, so the oracle — which is
configured for `**/*.svelte.js` / `**/*.svelte.ts` (`lint-oracle/run.mjs:132`) and lints
whatever file list it is handed (`:181`) — is never asked about a module. The diff loop
iterates components only (`:178`). **[S]**

**Correction (2026-08-07).** An earlier revision of this row said rsvelte-lint's module findings
"land in `byFile`" and that "both sides produce module findings; neither is compared". That was
wrong, and it is worth recording how: the claim was inherited from a sweep and shipped with an
`[S]` label without the citation being opened. `rsvelte-lint` **cannot lint a module at all** —
`collect_files` (`crates/rsvelte_lint/src/main.rs:65-82`) admits a path only when
`path.extension() == "svelte"`, both on the directory walk (`:71`) and on an explicit path
argument (`:75`), and `Path::extension()` returns `"js"` for `a.svelte.js` and `"ts"` for
`a.svelte.ts`. **[D]** Verified with a standalone `rustc` program over all four cases:
`a.svelte` → `Some("svelte")`, match; `a.svelte.js` → `Some("js")`, no match; `a.svelte.ts` →
`Some("ts")`, no match; `a.js` → `Some("js")`, no match (negative control).

So the surface is unguarded on both sides, and the two causes need fixing in order — see
`main.rs` gap below, then the gate filter. Removing `lint-verify.mjs:84` **alone** would not
measure rule parity; it would fill the ratchet with `-` (false-negative) entries reporting that
the rsvelte CLI linted none of those files.

The engine is not the limitation: `run_script_rules_module` (`crates/rsvelte_lint/src/engine.rs:332`)
is public and implemented, `engine.rs:124,132` dispatch `.svelte.js`/`.svelte.ts` to it, and
several rules implement the `ScriptRule` hook specifically to reach it (`no_store_async.rs:5`,
`require_stores_init.rs:4`). Only the CLI's file collection is missing.

**This blind spot is a feedback loop, not a gap.** `prefer_svelte_reactivity.rs:19-21` declines
to port a rule path upstream implements, stating the reason outright: *"The plugin additionally
flags exported instances in `*.svelte.js` / `*.svelte.ts` modules; those fixtures are
`.svelte.js` files (not collected by the component oracle) and that path is intentionally not
ported here."*

Read that carefully. The ungated surface did not merely *hide* divergence — it **licensed** it,
and the licence is written down in a place where nothing forces it into view. A gap leaks; a
loop widens. Every gate this document describes can do the same thing, because "the oracle does
not cover it" is always available as a reason to stop, and it is always locally reasonable.

That is the strongest argument here for maintaining the inventory, and it is stronger than any
single row: the cost of an unobserved surface is not bounded by the defects that have drifted
into it, because the surface also decides what gets built. **When you scope work by what the
gate checks, the gate stops being a measurement and becomes the specification.**

### Blind spot 11b — duplicate findings collapse

Both sides are `Set`s (`:105`, `:133`, `:153`). **[S]** If rsvelte-lint emits the same finding
twice at the same position — a shape `crates/rsvelte_lint/src/registry.rs:36-38` explicitly
warns about — the Set collapses it. Deliberate contrast: the svelte-check gates use *multisets*
specifically to avoid this (`check-verify.mjs:31-35`).

### Blind spot 11c — an oracle-fatal file drops rsvelte's findings for it, with no ceiling

`lint-verify.mjs:182-187`: `if (o?.fatal) { oracleFatal++; continue; }`. **[S]** rsvelte can
emit 50 false positives in a file `svelte-eslint-parser` rejects and it is invisible; the count
is printed (`:206`) and never gated.

### Blind spot 11d — autofixes, suggestions and severity

The oracle projects each message to `{ruleId, line, column, messageId, message}`
(`lint-oracle/run.mjs:201-209`), discarding `fix`, `suggestions`, `severity`, `endLine`,
`endColumn`. rsvelte's SARIF `fixes` array and `level` are never read (`lint-verify.mjs:143-155`).
Severity is *pinned* to `warn` on both sides (`lint-oracle/run.mjs:72`, `lint-verify.mjs:118`).
**[S]** Compensating control: `crates/rsvelte_lint/tests/eslint_plugin_oracle.rs` compares
autofix output byte-for-byte on fixtures.

### Blind spot 11e — the rule universe is an intersection with no floor

`lint-universe.mjs:64-85`: `rsvelte-lint --list-rules` ∩ `eslint-plugin-svelte.rules` − 9
excluded. `lint-verify.mjs:167-168` prints `universe.length` and asserts nothing. **[S]**
Removing a rule from `crates/rsvelte_lint/src/registry.rs` drops it from the universe, filters
it out on *both* sides (`:110`, `:145`), and goes green — for any rule with no entry in the
80-entry ratchet. A rule rsvelte never implemented is invisible by construction.

### Blind spot 11f — CI collects a narrower corpus than the script offers

`corpus-compat.yml:380` passes an explicit source list omitting `svelte` and `svelte.dev`,
which `lint-collect.mjs:42-43` does list. **[S]** In CI the lint corpus contains no `.svelte`
file from the Svelte repo and no documentation snippet. `compatibility/pattern-corpus` — the 32
hand-written regression repros — is also not in that list.

---

## 12-13. svelte-check diagnostic parity (Layer 1 fixtures, Layer 2 e2e)

**Unit.** A multiset of `` `${severity} ${relpath}:${line} ${code}` `` (`check-diagnostics.mjs:18`,
`:63`). Layer 1 = 30 committed scenarios under `compatibility/check-fixtures/`
(`check-verify.mjs:149-156`); Layer 2 = 3 units in 2 real repos
(`check-e2e-verify.mjs:62-98`), sharing the same parsing module (`:49`).

### Blind spot 12a — column, message, `source`, and `end` are outside the key

`check-diagnostics.mjs:63` builds the key from `d.type`, `d.filename`, `d.start.line`,
`d.code`. `message` and `source` are captured into `detail` (`:65`) and written to the report
(`check-verify.mjs:239,247`) but never diffed. **[S]** The line-position part is deliberate and
documented (`check-verify.mjs:25-29`); the consequence is that the exact regression class of
scenario `svelte-import-diagnostic-line` (#2112, "pinned every import diagnostic to line 1") is
caught only because it moved the *line* — a column-only version is invisible.

### Blind spot 12b — the `COMPLETED … FILES` summary is discarded

`check-diagnostics.mjs:55` skips every non-`{` payload; `:62` drops every non-ERROR/WARNING
type. The summary line emitted by `crates/rsvelte_diagnostics/src/writers.rs:263-275` is never
parsed. **[S]** A scenario where rsvelte-check walks *fewer files* than official and the
missing files are clean compares equal. Given that the check gates exist for workspace and
file-discovery parity (`check-verify.mjs:14-17`), this is the sharpest blind spot in the family.

### Blind spot 12c — no positive-control assertion, and both ratchets are `[]`

`check-verify.mjs:240-242` logs counts and asserts nothing about them. **[S]** Any scenario
whose oracle diagnostic set is empty is green whether rsvelte-check ran correctly or produced
nothing at all. A *global* collapse would still be caught (scenarios that expect errors would
diverge), but per-scenario vacuity is not.

### Blind spot 13a — whether the Layer 2 units produce any oracle diagnostics at all

**[U]** `compatibility/check-e2e-report.json` is gitignored (`.gitignore:166`) and the
submodules are not installed in this worktree. If all three units are clean under official
svelte-check — plausible for a maintained starter and a library that runs `pnpm check` in its
own CI — then Layer 2 is structurally a "rsvelte-check must also find nothing" test: it catches
false positives and nothing else. **This is a question, not a finding.** Resolve it by reading
`check-e2e-report.json` from a CI artifact.

### Blind spot 12d — the CLI surface is one point

`check-verify.mjs:197-202` forwards only `--workspace`, `--tsconfig`, and per-scenario `args`.
Exactly one of 30 scenarios uses `args` (`ts7-native`: `["--tsgo"]`). **[S]** `--threshold`,
`--fail-on-warnings`, `--ignore`, `--compiler-warnings`, `--watch` and the `human` /
`machine` / `github-actions` output formats are compared against the oracle nowhere.

### Blind spot 12e — the tsc/tsgo equivalence claim is asserted, not measured

Both matrix legs ratchet against the same `check-known-failures.json` (`check-verify.mjs:88`),
justified at `:81-87` by "measured locally, tsc and tsgo produce IDENTICAL diagnostic sets".
**[S]** Nothing in the repo re-verifies that.

---

## 14. Compiler source-map gate — `crates/rsvelte_core/tests/sourcemaps_gate.rs`

**Unit.** 29 samples from the upstream sourcemaps suite: 23 hand-ported anchor assertions
(`:127-189`), out-of-range segment budgets, and `map-parity` against the official map. Floors at
`:1011-1028`; staleness fatal at `:1061`. Ratchet: 74 entries.

### Blind spot 14a — segments rsvelte *adds* are never inspected

`parity()` iterates `theirs.lines` only (`:537`). **[S]** A segment rsvelte emits at a generated
position where the official map has none is never visited; `out_of_range` (`:463-501`) flags
only positions past end-of-line and `has_negative_segment` (`:507`) only negatives, so an extra
mapping to an in-range original position passes all three checks.

### Blind spot 14b — `sources`, `sourcesContent`, `names`, `file`, `version`

`parity` compares `s[1..4]` only (`:548`); `names` is explicitly excluded (`:273`). **[S]**
Changing rsvelte's `sources` to `["wrong.svelte"]` leaves the source index at 0 and every check
passes.

### Blind spot 14c — `dev: true` maps

`compile_sample` (`:616-621`) never sets `dev`, and `EXPECTED_FIXTURE_COMPILE_OPTIONS` pins the
oracle to `{"dev":false}` (`:219`). **[S]** Positive control: `command grep -n "dev"` on this
file returns only line 219, while the same grep on `ast_gate_preconditions.rs` returns lines
66/80/83 — that file *does* cover client-dev.

### Blind spot 14d — CSS maps get one anchor

`measure()` loops `[Target::Client, Target::Server]` (`:724`) and `official()` returns `None`
for `Target::Css` (`:671`). **[S]** No out-of-range, negative, missing-map or parity check for
CSS maps; the whole surface is one anchor on one sample (`:138`).

### Blind spot 14e — the parity population can rotate under a fixed floor

`EXPECTED_IDENTICAL_OUTPUTS = 57` (`:1023`) is a floor on the *count*, and the "NO LONGER
MEASURED" branch (`:959-967`) fires only for pairs that have a budget entry. **[S]** A change
that breaks byte-identity for one unratcheted pair while fixing another keeps the count at 57
and reports nothing; the dropped pair silently stops being measured.

Related open work: #1781 (client maps are chunk-granular; 16% point outside the source range).

---

## 15. `crates/rsvelte_core/tests/ast_gate_preconditions.rs`

**Unit.** For every `.svelte` sample in 6 suites (`:19-26`) × 3 targets (`:64-68`),
`rsvelte_ast_equiv::canonicalize(&result.js.code)` must not error (`:93`) — i.e. rsvelte's own
output parses with OXC, 100%.

### Blind spot 15a — compile failures are skipped, so errors make the gate *greener*

`:90-92`: `let Ok(result) = compile(...) else { continue };`. The skip itself is deliberate and
justified in-code — *"these samples include deliberately invalid input, and validation is gated
elsewhere"* — so the blind spot is not the `continue`, it is that **nothing counts how many
samples survived it**. **[S]** The only floor is `files.len() > 1000` on *input discovery*
(`:57`); there is no per-target floor on samples actually canonicalized. Breaking `server`
codegen so `compile()` returns `Err` for 200 samples leaves `files.len()` unchanged, `continue`s
past all 200, and leaves `failures` empty.

The fix is therefore a counter, not a policy change: assert that the number of samples reaching
`canonicalize` per target stays near its measured value.

### Blind spot 15b — it parses the left side only

`compare_with` (`ast_equiv.rs:219`) can report `Unparseable{side: Right}`; this precondition
never evaluates the oracle's output. **[S]**

### Blind spot 15c — it cannot see the `CommentPolicy` problem (gate 1a)

`canonicalize` inspects only the `Err` branch. `CommentPolicy` affects the comment vector
(`lib.rs:161-173`) and the annotation flag (`:186`), neither of which influences whether
`Parser::parse` succeeds (`:152-159`). **[S]** Positive control:
`grep -n "CommentPolicy\|comments\|argv"` on this file returns no hits. Recorded because the
existence of an "AST gate precondition" test invites the assumption that the AST comparator is
under test here. It is not.

### Blind spot 15d — wrong population for the gate it serves

It covers the Svelte sample corpus; the gate that consumes the precondition (`verify.mjs`) runs
over 14,025 real-world entries. **[S]** `ast-equivalence.md:97-100` claims all 3888 flowbite
outputs parse; nothing asserts that.

---

## 16. Validator fixture suite — `crates/rsvelte_core/tests/validator.rs`

**Unit.** Per fixture, the emitted error code / warning set against the upstream expectation.
Ratchet: `compatibility/validator-known-failures.json`, **207 entries** against a 332-fixture
floor (`validator.rs:29`) — ~62% of the suite is on the forgive list.

### Blind spot 16a — the ratchet is one-sided; staleness is not asserted

`validator.rs:454-458` asserts `regressions.is_empty()` only. `fixed` is computed at `:431` and
merely printed (`:433-442`). **[S]** Positive control that two-sidedness is the house rule:
`sourcemaps_gate.rs:1061` and `css-prune-sweep.mjs:514` both make staleness fatal, and
`verify.mjs:588-603` calls it out explicitly ("a large *now PASS* delta on the next PR is
indistinguishable from noise, so a real regression can hide inside it").

Consequence: the 207-entry list is under no shrink pressure, and an entry that starts passing
silently re-covers a future regression on that same fixture. Per
`compatibility/validator-known-failures.md`, ~141 of the 207 are *"error spans come back
`None..None`"* — the same class gate 4a shows the corpus cannot see either.

---

## 17. svelte2tsx fixture suite — `crates/rsvelte_projection/tests/svelte2tsx_fixtures.rs`

**Unit.** Per upstream fixture, TSX text. Ratchet:
`compatibility/svelte2tsx-fixtures-known-failures.json`, 5 entries.

### Blind spot 17a — closed: absolute floor (#2454) and two-sided ratchet (#2507)

`MIN_S2TSX_FIXTURES = 254` (`:30`, asserted at `:155`) is an absolute floor on the samples
actually compared, and both `regressions.is_empty()` (`:192`) and `fixed_known.is_empty()`
(`:210`) are fatal. **[S]** The erosion this recorded — an upstream layout change under
`packages/svelte2tsx/test/svelte2tsx/samples` leaving 1 readable sample instead of 254 —
now fails twice: below the floor, and on the 5 baseline names landing in `fixed_known`.
Measured when the staleness assert was added: 249 pass / 5 fail / 0 stale, so the ratchet
was truthful at 5 entries and needed no re-baseline.

### Blind spot 17b — vacuous skip on a missing submodule

`:68-81` returns early (= pass) when `submodules/language-tools` is absent, gated only by
`RSVELTE_REQUIRE_PREREQS`. **[S]** CI sets it (`ci.yml:300`) and checks the submodule out
(`ci.yml:187`), so this holds today — recorded as a dependency, not a live defect.

**For the record, the other fixture suites are not vacuous:** generated-fixture suites call
`ensure_fixtures_exist()` (panics, `common/mod.rs:59-78`) and `ensure_fixtures_fresh()` (panics
on manifest/HEAD SHA mismatch, `:124-137`); submodule-sourced suites reach
`assert!(self.found > 0)` (`:295-300`). The centralized skip lists total **8 entries**
(`common/mod.rs:383,403,406,414,728`), plus 3 outside `common/` (`css.rs:76`, `print.rs:141`,
`parser_fixtures.rs:120,132`), all audited by `crates/rsvelte_core/tests/audit_skipped.rs`.

### Blind spot 17c — the tail after the cut is dropped from both sides

`relaxed_compare_structural` (`tests/common/svelte2tsx.rs:122-141`) truncates **both** texts at
the last `\n\nexport default class` / `\nexport const ` / `\n/** @template ` /
`\nclass __sveltets_Render` / `\nconst ` and compares only what precedes it. **[S]** The
exported component class and the `__sveltets_Render` wrapper are therefore never compared.
What survives the cut is then run through a chain of normalizations (from `:143`), and one of
those stages has already hidden a real divergence: `strip_return_statement` deleted the whole
`return {…}`, so `$$slot_def["b"]` vs official's `'b'` matched — **[D]**, closed in #2145 by
re-verifying the return statement on its own (`:515`), which in turn concedes the fixture when
either side has no `return` statement (`:520-523`).

---

## 18. Compatibility report — `crates/rsvelte_devtools/tests/compatibility_report.rs`

This is the source of the Test Status table in `AGENTS.md` and `README.md`.

### Blind spot 18a — warnings are compared by count

`compatibility_report.rs:751`: `let warnings_match = actual_count == expected_warnings.len();`
**[S]** Never the code, never the message, never the span. Emitting
`a11y_missing_attribute` where upstream emits `a11y_img_redundant_alt` on the same sample
matches. This is how `AGENTS.md` reports `Validator 333/333` and "All in-scope fixtures pass
(100.0%)" while `validator-known-failures.json` holds 207 real divergences.
(`tests/validator.rs` *does* check the code — for the 125 fixtures not on the ratchet.)

**Tracked:** #2452. **Closing it:** compare the warning code multiset in the report. Cost: low. The number in
`AGENTS.md` will drop, which is the point.

---

## 19. Output parseability — `scripts/compat-corpus/verify.mjs` ("output parseability" section)

**Unit.** For each of ~14,025 manifest entries × 3 targets, the single file
`compatibility/actual/<id>/<target>.js` — rsvelte's generated module, **before** any
normalization — fed to `acorn.Parser.parse` with
`{ecmaVersion:'latest', sourceType:'module', allowHashBang:true}` (`parseable.mjs:31`). One bit
per module: parses, or does not. Ratchet `parse-known-failures.<target>.json`, currently 0
entries on every target. Official's module is parsed too, but only as the oracle's own control:
a rejection there exits 2 as a harness failure and can never become a ratchet entry.

**Why it exists.** Gates 1-4 all compare rsvelte's text to official's text, so *wrong text* and
*text that is not JavaScript* produce the same verdict and land in the same ratchet — and a
ratchet entry suppresses everything about its entry, not only the divergence it was filed for.
This gate is a different question with its own ratchet, so an entry listed in
`known-failures.<target>.json` for a text mismatch cannot absorb a later regression to
unparseable output. It also closes two blind spots recorded for gate 15: **15d** (wrong
population — 15 parses the Svelte fixture corpus, not the real-world one) and the oracle half of
**15b** (15 uses OXC, the parser rsvelte itself parses JavaScript with; this one uses acorn, a
separate implementation, so an OXC-only acceptance quirk is observable).

**Calibration.** Compiling 3,509 real-world components with the **official** compiler over all
three targets yields 10,464 modules; acorn under these options rejects 0 of them. Positive
control in the other direction: of the 30 components for which rsvelte emits output esbuild
rejects, acorn rejects 30. Both figures are measured, not estimated.

That calibration corpus was **not representative of this gate's population**, and the gate said
so on its first CI run: official's own client output for
`compiler-errors/samples/const-tag-snippet-invalid-reference-1` declares `foo` twice in one
scope, which acorn rejects as an early error. Those pairs are enumerated in
`parse-oracle-excluded.json` (2 entries, justified in the paired `.md`) and skipped on **both**
sides — where the reference does not parse there is no claim to make about rsvelte. The list is
shrink-only in both directions: an unlisted oracle rejection exits 2, and a listed pair whose
official output now parses also exits 2.

### Blind spot 19a — it says nothing about whether the output is correct

A module that parses can compute the wrong thing, and this gate scores it a pass. **[S]** The
verdict is the boolean return of one `Parser.parse` call (`parseable.mjs:39-47`); no property of
the AST is inspected and official's bytes are not consulted. This is not a weakness to close —
gate 1 is the correctness gate — but it is the reason a green row here is worth exactly one
claim.

**[D]** Two witnesses, both from the same sweep that motivated this gate, so the blind spot is
measured rather than argued. In each the *same* defect produced unparseable output in some files
and valid-but-wrong output in others; the gate sees only the first group.

- #2603. The dev prop-mutation mis-splice made 9 files unparseable and 6 files parseable and
  wrong. In `huly/…/EmployeeFilter.svelte` it emitted
  `$$ownership_validator.mutation(…, filter().modes = $.strict_equals(filter().modes, undefined), 42, 2) ? […] : filter().modes`
  — valid JS that assigns the **boolean** rather than the ternary's result. Only output
  comparison finds it.
- #2598. The escaped-backslash scanner emitted a bare `$:` labelled statement in
  `General.svelte`, which every JS parser accepts.

The practical consequence for triage: **the loudness of a failure is a property of the input,
not of the defect.** A cluster's unparseable members are the visible tail of a larger set, so
sizing a text-scanning defect by its parse-gate count understates it. Both PRs measured the
split — #2603 at 9 unparseable of 15 changed — rather than assuming the parseable remainder was
unaffected.

### Blind spot 19b — JS only; CSS, source maps and every other output field are outside it

**[S]** The gate reads `<target>.js` and nothing else (`verify.mjs`, "output parseability"
loop). `<target>.css` is never handed to a CSS parser, so a malformed stylesheet is invisible
here exactly as it is to gate 1's byte comparison when the entry is ratcheted. `js.map` is not
captured by `compile.mjs` at all (blind spot 1c), so there is nothing to validate.

### Blind spot 19c — the population is inherited from the corpus, and the known defects are not in it

**[S]** `corpus-sources.json` lists sveltejs/svelte, svelte.dev and 33 shipped libraries. The 30
real-world components that currently produce unparseable rsvelte output are in huly, open-webui,
carbon and SMUI — none of which is a corpus source. The ratchet is therefore empty **because the
inputs are absent**, not because the class is fixed. This gate is a regression gate for that
class, not a burn-down of it. Enrolling those repositories would change the number; nothing else
in this gate's design would.

### Blind spot 19f — an excluded pair is checked on neither side

**[S]** A `parse-oracle-excluded.json` entry removes rsvelte's output from the gate as well as
official's, so rsvelte could emit anything at all for those 2 pairs and this gate would not
notice. That is deliberate (there is no reference), but it is a hole, which is why the list is
enumerated per `(id, target)` and shrink-only rather than a predicate. `scripts/dev/test-corpus-parse-gate.mjs`
pins it: the "listing the pair skips it on BOTH sides" case seeds an unparseable rsvelte output
alongside the excluded official one and asserts the run is green *and* that the pair is not
counted in the parsed population.

### Blind spot 19d — one parser, so a shared acceptance bug is unobservable

**[S]** The oracle is acorn alone. Any construct acorn accepts and a real-world engine (V8,
JavaScriptCore, esbuild's bundler) rejects passes. The 30-file control shows acorn and esbuild
agree on today's failures, which is evidence the two are not far apart — it is not evidence that
they never differ. Closing it would mean a second parser on the same text; cost is one more
parse of ~42,000 modules and was not measured.

### Blind spot 19e — `--targets` narrows it silently

**[S]** The gate iterates `TARGETS`, which `selectTargets` narrows from `--targets`. A run
scoped to one target parses one target's modules, exactly like every other comparison in
`verify.mjs`. The FALSE-SHRINK guard on `--update-parse-baseline` is
`requireFullCorpus(manifest.length, …)`, which counts *entries*, not entries × targets — so a
`--targets client --update-parse-baseline` run rewrites only the client ratchet (the loop is
over `TARGETS`), but nothing warns that the other two were not measured. Inherited from the
existing diagnostic families, not introduced here.

---

## 20. Corpus-seeded mutation fuzz — `scripts/compat-corpus/mutate-corpus.mjs`

**Unit.** Per mutant × target, official vs rsvelte `js.code`, normalized exactly as gate 1
normalizes. A mutant is a seed with **one comment inserted at a line boundary** inside a
`<script>` region (`:227`).

**This section was added after the fact.** `AGENTS.md` requires a gate's row *before* its ratchet
is first baselined; #2281 shipped this gate and `mutation-known-failures.json` without one, and
the omission stood until a defect went looking for it. Named here rather than silently filled,
because the next gate author will otherwise repeat it.

**Three populations appear below and they are routinely confused.** 14,138 = manifest entries,
the seed set. 12,166 = mutants actually generated (a seed with no insertion slot is skipped).
39,563 = *(entry, target)* pairs for which rsvelte emitted a module and gate 19 acorn-parsed it
(`verify.mjs:358-360`). Note that gate 19's unparseable counter is per **entry**, not per pair
(`verify.mjs:365`), so its headline number and that denominator are not in the same unit.

### Blind spot 20a — the operator inserts comments, so a bracket in a *string* is never moved

*Not closable by scale — the contrast with 20b is the point.*

**[D]** `:227` splices `COMMENT_KINDS[kindName]` into the source and changes nothing else. All
eight kinds (`matrix/axes.mjs:178-187`) are comments. The gate reaches a defect whose trigger is
a delimiter inside a **comment** and never one whose trigger is the same delimiter inside a
**string, template or regex literal**.

Discriminating case. `transform_class_fields_server` counted `(){}[]` byte by byte, so on the
server target a two-field class whose second `$derived.by` spans lines with `q: ")"` in it
dropped that field and every member after it, leaving `);` at statement position. Official is
correct and rsvelte's own *client* target is correct. Its comment-carrying twin (`// ) c` in the
same slot) **was** reported by this gate; the string form is unreachable by construction and was
found by hand while fixing the twin. Fixed by #2639.

What is measured about the corpus, and what is not: gate 19 reported **0 unparseable of 39,563**
on the `80abbe52` main run, with `parse-known-failures.{client,server,client-dev}.json` all `[]`.
So **nothing in the corpus triggers this defect at any target** — which is *not* the claim "the
shape is absent from the sources", a thing nobody has measured. The first also carries gate 19's
own hole: `parse-oracle-excluded.json` lists 2 pairs checked on **neither** side (19f).

The lesson this document exists for: **growing the corpus cannot close this, and neither can more
mutants.** Only an operator that edits existing tokens reaches the class. Related: #2637 makes
the same point on another axis — the fuzzer inserts comments, not operators, so a `$:` line
ending in `*` or `%` is outside it too.

### Blind spot 20b — one mutant per seed, at a hash-chosen slot

*Closable by scale — the opposite of 20a, which is why the two must not read as one item.*

**[S]** `PER_FILE` defaults to 1 (`:96`) and the slot is `slots[h % slots.length]` with
`h = fnv1a(id#n)` (`:216-217`). A seed with 40 insertion slots is sampled at one of them, fixed
for that id — it contributes 1/40 of its own surface. Two independent defects in one file are
never both observed, and which one is observed is decided by a hash. The full sweep's 12,166
mutants are 12,166 seeds sampled once, not a sweep over slots.

**`--per-file n` closes this and nothing else has to change**; cost is linear and the ratchet keys
already carry `__m<n>__` so they do not churn.

### Blind spot 20c — `already PASS` cannot distinguish *fixed* from *no longer produced*

**[S]** The staleness check is `baseline.filter((id) => !ids.has(id))` (`:661`) — a baseline key
absent from this run's failures. `ids` is `` `${f.id} [${f.verdict}] (${f.target})` `` (`:588`).
An entry leaves that set for at least four reasons and the output calls all of them "already
PASS":

1. the defect was fixed;
2. the seed file no longer exists, so no mutant is generated (`:144` filters the manifest to
   sources present on disk) — a corpus-source removal or a submodule bump does this;
3. the seed's **content** moved. `n` and `kindName` derive from the seed id alone, but the
   **slot** is `slots[h % slots.length]` over the current line list, so an edit anywhere in the
   file relocates the comment while the key stays identical. The same id then denotes a
   different mutation, which may pass for reasons unrelated to any fix. The comment at
   `:220-223` states this trade deliberately — keying on the line would churn every entry in a
   seed on any edit — so the exposure is the accepted cost, not an oversight;
4. the **verdict class** changed. The verdict is in the key, so `code-mismatch` →
   `comment-mismatch` retires the entry as "already PASS" while the entry still diverges.

Consequence for re-baselining: an `already PASS` count is only evidence of fixes if the corpus
tree did not move. Two checks, and they cover different reasons.

*Reason 2* — `git log --oneline <since> -- submodules scripts/compat-corpus/corpus-sources.json`
returning nothing, with a non-empty commit count over the same range as the positive control.
This covers seeds vanishing because the tree moved; it does **not** cover a source absent from
the working copy (**C7**).

*Reason 4* — **measured `[D]` 0**, in the `code-mismatch ⇄ unparseable` direction. Method:
extract `id (target)` from the NEW-divergences and already-PASS lists with the verdict stripped
and intersect; an entry that merely changed class appears in both. Empty at `d1eedb3f` over
14,138 seeds. The instrument is shown to move by the same counter reporting 16 unparseable at
`d88546a7` and 10 at `39ba6489` on the same day, so this is not the vacuous kind of zero.

That covers only the two verdicts the baseline can represent. **Transitions into
`comment-mismatch` remain unmeasured**, because those ids are never recorded — `:555-557`
increments the counter and `continue`s before any `failures.push`, so no comment-mismatch key
exists to intersect against. Closing that half needs the id recorded alongside the count. The
first attempt at this cell proposed intersecting against that non-existent set, which would have
returned empty regardless of the truth — a vacuous zero is worse than a blank, because the blank
advertises itself.

### Blind spot 20d — insertion is line-boundary only, and `<script>` only

**[S]** `insertionSlots` (`matrix/mutate.mjs:41-61`) yields line boundaries inside `<script>`
ranges. A comment inside an expression (`f(/* c */ x)`), in a template-markup slot, or between
two tokens on one line is never generated. Same shape as blind spot 5c, from the same helper.

### Blind spot 20e — only the `code` class is ratcheted per id

**[S]** `:598` restricts the per-id regression check to `code-mismatch` and `unparseable`;
`comment-mismatch` is an aggregate count (`:695-696`). On the full sweep that is 13,242
divergences with no per-entry gate. Deliberate and documented (`AGENTS.md`; gate 5 ratchets
comment fidelity per id on generated seeds that do not move when a submodule bumps) — but a
comment regression on a *collected* seed is invisible here.

---

## Cross-cutting

### C1. Path filters — gates that do not run on some PRs

`ci.yml` is deliberately unfiltered (`:6-8`, with the reason in a comment), so every Rust
fixture gate runs on every PR. `corpus-compat.yml` **is** path-filtered (`push:` `:39-85`,
`pull_request:` `:87-133`, kept in sync by hand).

- **[S] `submodules/eslint-plugin-svelte` and `submodules/svelte-eslint-parser` are consumed by
  `lint-parity` (`corpus-compat.yml:356`, `:380`) but appear nowhere in either paths list.**
  Positive control: `command grep -n "eslint" .github/workflows/corpus-compat.yml` returns 6
  hits, all at `:343` or later — zero inside `:39-133`. A PR whose only change is advancing that
  gitlink runs no corpus gate at all, and `lint-known-failures.json` is never re-validated
  against the new upstream rule set.
- **[S]** Also absent from the list but reachable by the jobs: `scripts/fixtures/**` (except one
  oxfmtrc), `package.json` (which `test-fmt-corpus` reads for pins, `ci.yml:549-550`),
  `apps/**`, `.github/actions/**`.
- **[S]** `type-aware-lint.yml:17-33` filters to the lint crates but omits
  `submodules/typescript-go`, which it drives — mitigated only by its weekly `schedule:` (`:36`).
- **[S]** `coverage.yml:6-7` and `codspeed.yml:6-7` use `pull_request: branches: [main]`, so a
  stacked PR based on another feature branch skips them — the exact failure mode `ci.yml:6-7`
  documents and guards against. `capi.yml:26` carries the comment `# Unfiltered: see ci.yml.`
  immediately above a `paths:` filter (`:27-33`).

### C2. Ratchet documentation is checked for 3 of 16 families

`known-failures-md-check.mjs` covers `known-failures.md` (`:37`), `warning-known-failures.md`
(`:89`) and `matrix-known-failures.md` (`:153`). `ls compatibility/*.md` returns **16**.

**[D] `compatibility/sourcemap-known-failures.md:158` says `| ratchet entries | 75 | **73** |`
while `sourcemap-known-failures.json` has 74.** Already drifted, in an unchecked family.

### C3. Population floors — who has one

| Gate | Floor | Cite |
|---|---|---|
| corpus verify | manifest ≥ 1000; ≥99% compiled; ≥12000 to rebaseline | `verify.mjs:204,224`; `artifacts.mjs:79` |
| svelte2tsx verify | manifest ≥ 1000 components; ≥12000 to rebaseline | `svelte2tsx-verify.mjs:85,237` |
| fmt verify | `included` ≥ 1000 — **but not the comparisons performed** | `fmt-verify.mjs:69`; gap at `:97` |
| lint verify | zero corpus files → exit 2; **no universe floor** | `lint-verify.mjs:163`; gap at `:167` |
| sourcemaps gate | 3 floors (samples, anchors, identical outputs) | `sourcemaps_gate.rs:1011-1028` |
| fmt Rust corpus | non-empty samples + `assert!(!in_corpus_job())` on every skip | `svelte_dev_corpus.rs:71-74,262` |
| ast gate preconditions | input files > 1000 — **no output floor** | `ast_gate_preconditions.rs:57`; gap at `:90` |
| svelte2tsx fixtures | `total_tested >= 254`, absolute | `svelte2tsx_fixtures.rs:30,155` |
| **css-prune sweep** | **none** | `css-prune-sweep.mjs:482` is a `console.log` |
| check / check-e2e | scenarios > 0; **no diagnostic floor**, ratchets are `[]` | `check-verify.mjs:179`; gap at `:240` |

### C7. An uninitialised corpus source shrinks the population silently, and no floor catches it

**[D]** `collect.mjs:168-178` walks `corpus-sources.json` and, for a source whose directory is
missing or empty, warns and `continue`s. Only `src.required` sources abort (`:171-174`) — and
**2 of 36 sources are required**, so 34 can each disappear from the measured population while
`collect.mjs` exits 0 and writes a manifest that looks complete.

Observed, not hypothetical: a sweep run with `runed` and `svelte-toolbelt` uninitialised
measured **14,035** entries instead of 14,138, and **10 baseline entries came from those two
sources**. `--update-baseline` deletes every baseline id it did not measure, so those ten would
have been dropped as fixed.

The floor does not help. `MIN_FULL_CORPUS_ENTRIES = 12000` (`artifacts.mjs:87`) guards against
*catastrophic* under-measurement; 14,035 clears it comfortably. A partial corpus is invisible to
a lower bound **by construction** — the only thing that surfaced it was comparing the local
manifest count against CI's.

This sits upstream of blind spot 20c's reason 2 and applies to every corpus-derived gate (1, 2-3,
4, 19, 20), not only the mutation fuzz. Closing it means asserting the *set* of collected
sources against `corpus-sources.json`, not the entry count — an entry count cannot distinguish a
missing source from a source that shrank.

### C4. Gate scripts that no workflow invokes

`git ls-files scripts/compat-corpus` lists 26 `.mjs` files; 15 are referenced by a workflow. The
other 11 are all libraries imported by an invoked gate (`normalize.mjs`, `targets.mjs`,
`artifacts.mjs`, `sourcemap.mjs`, `lint-universe.mjs`, `check-diagnostics.mjs`,
`matrix/{axes,generate,mutate}.mjs`, `lint-oracle/run.mjs`) or self-declared triage CLIs
(`one.mjs`, `fmt-one.mjs`, `fmt-cluster.mjs`, `svelte2tsx-cluster.mjs`, `clean.mjs`).
**There is no orphaned gate script.** The orphan risk in this repo is C1 and C2, not C4.

### C5. `compatibility/pattern-corpus` records history; it cannot surface a live bug

102 tracked files: ~32 hand-written `issues/<n>-<slug>.svelte` repros plus feature matrices. It
is a corpus *source* (`corpus-sources.json:37`, `required: true`), so it flows into the compiler,
svelte2tsx and formatter parity gates. It does **not** flow into the lint gate (C1 / blind spot
11f) or the shape matrix (which generates its own inputs). And by its own convention
(`pattern-corpus/README.md`, rule 6) "a repro lands with its fix, not before" — so an open
divergence is by policy absent.

### C6. Every performance gate measures a population where legacy `$:` is absent or a minority

The correctness gates above sample published *library* code. So do the performance gates, and
for performance that is the wrong population by a factor of 5.6 — or 4.0, depending on which
side carbon is counted on; see the note under the table.

**[D] Legacy `$:` density, by the two populations we own.** A file counts as legacy if any line's
first non-whitespace token is `$:` (`^[ \t]*\$:`, multiline). Stated because it is a heuristic:
it counts a `$:` nested inside a block, and misses one written after `{` on the same line.

| population | files | legacy files | bytes | **legacy bytes** |
|---|---|---|---|---|
| libraries — `submodules/`, 23 repos | 13,078 | 478 (3.65%) | 15,098,016 | **12.34%** |
| applications — huly/plugins | 2,123 | 1,252 (58.97%) | 7,124,519 | **74.87%** |
| applications — open-webui | 650 | 215 (33.08%) | 3,612,860 | **70.26%** |
| applications — carbon (`src/` only) | 287 | 173 (60.28%) | 941,662 | **87.90%** |
| applications — SMUI | 449 | **0 (0.00%)** | 951,109 | **0.00%** |
| **applications, aggregate** | **3,509** | **1,640 (46.74%)** | **12,630,150** | **68.89%** |

The carbon row is `src/` only. The repo holds **1,324** `.svelte` files — 525 under `tests/`,
425 under `docs/`, 291 under `src/`, 78 under `e2e/` — and scored whole it is 250/1,324
(18.9%) rather than 60.3%. The scope is deliberate (`tests/` and `docs/` are not field compile
volume) but it moves that row by 3.2x, so it is stated rather than left to be re-derived.

carbon is also a **component library** published to npm, counted on the application side
because its `src/` is hand-written Svelte rather than a shipped bundle. That placement is what
sets the ratio: moving it to the library population gives libraries 16.78% and applications
67.36%, i.e. **4.0x instead of 5.6x**. The finding survives the reclassification and the
headline number does not, so both are recorded.

Legacy files are 3.7x larger than the rest in the library corpus and 2.5x larger in the
application corpus, so **files and bytes disagree by ~3x and bytes is the closer weight** for
anything that scales with script content. Published libraries also frequently ship
pre-compiled, so application source is the better proxy for real compile volume.

The per-repo rows are **bimodal** — 0% or ≥33%, nothing in between. A corpus is not
"partly legacy"; each repo is one thing or the other, so an aggregate over a
library-weighted sample does not interpolate to an application.

**What this under-weights — and a stale number to stop repeating.** The bench corpus is widely
described as "8 of 9 runes", including in `benches/corpus/README.md`'s own distribution table,
which compares fixtures **01–09** against shipped code. That is out of date: fixtures 10 and 11
were added specifically to close that gap, and the corpus is now 11 files. Measured directly
(`command grep -lE '^[[:space:]]*\$:' benches/corpus/*.svelte`):

| corpus | legacy by files | legacy by bytes |
|---|---|---|
| bench fixtures (01–11) | 3/11 (27.3%) | 9,195 / 24,385 (**37.7%**) |
| libraries (`submodules/`) | 3.65% | **12.34%** |
| applications | 46.74% | **68.89%** |

So the timing gates are **under-weighted by ~1.8x against applications, not blind** — 05, 10
and 11 carry `$:`. The library corpus, at 5.6x under, is the badly-aimed one. Anyone reasoning
from "8 of 9 runes" will conclude the timing gates cannot see a legacy change at all; they can,
at roughly half the weight real application code would give it.

That makes such a change **falsifiable on CodSpeed rather than invisible to it**, which is the
stronger position: a legacy-path improvement should move the per-file IDs for `05-legacy-reactive`,
`10-legacy-typescript-props` and `11-store-heavy-legacy`, move `compile_both` by roughly the
legacy share, and move the eight runes fixtures by ~0. A uniform result across all eleven is
evidence *against* the change, not an artifact of the corpus.

The converse still holds for the library-weighted gates: **a regression in this path reads flat
on anything sampling `submodules/`**. The gate that sees it independently of corpus weighting is
the differential `to_value` counter added with #2622 (`2_analyze/mod.rs`,
`legacy_reactive_stays_typed`), which is deterministic and needs no quiet machine.

**Negative control, from two unrelated routes.** SMUI is 0.00% legacy by the source regex
above, and independently makes **0** `to_value` calls at the legacy-`$:` producer as counted by
the compiler instrumentation. Two mechanisms sharing no assumption agreeing on an exact zero is
what distinguishes this row from a heuristic that merely found no matches — the regex is
capable of returning a real zero, and did, on the one corpus where the compiler agrees.

**[D] The population difference is expensive — measured on a different path.** A sibling
investigation timed `process_accumulated` (`3_transform/profile.rs:115` — the part of the Phase-3
client line loop that transforms completed statements) across the same corpora:

| corpus | `process_accumulated` share |
|---|---|
| carbon | 30.2% |
| open-webui | 25.7% |
| huly/plugins | 22.5% |
| **applications, aggregate** | **22.8%** |
| **SMUI (negative control)** | **2.1%** |

SMUI sits with the runes libraries rather than with its fellow applications — a 10.9x split on
the same axis this row is about, from an instrument unrelated to the object counters above. This
is what establishes that sampling the library end is *costly*, not merely unrepresentative.

Two caveats, so the number is not over-read. `process_accumulated` spans **both** the rune and
the legacy `$:` statement transforms (`compile_profile.rs:276` takes its residual against
`st.runes` and `st.reactive_stmt`), so the SMUI/application split is *consistent with* the
legacy branch dominating it but does not prove the whole 22.8% is legacy. And it is a **Phase-3
script-text** path, not the Phase-2 JSON serialization the object counts above measure — the two
are adjacent consequences of the same source population, not the same work.

**What is *not* established here [U].** (a) The share of compile time attributable to the
Phase-2 legacy `$:` path specifically: two instruments tried and neither produced a defensible
number (`docs/phase3-ast-refactor-plan.md` § Findings 2026-08-08). (b) The legacy-vs-runes
decomposition of the 22.8% above, which `st.reactive_stmt` could settle directly. (c) Whether
four repositories represent application Svelte generally — the densities are 33-88%, so the
*direction* is not in doubt, but the aggregate is four samples.

---

## Predicates — cheap questions that find these without reading a gate end to end

Reading a gate line by line is how most rows here were produced, and it does not scale. These
two questions are mechanical, and each has already found real defects. Run them when you touch
this file; they are far cheaper than a full read and they convert `[S]` rows into `[D]` rows,
because a population you can empty is usually a population you can demonstrate.

### P0 — Is the verdict you are reading actually the check's verdict?

Apply this before the other two, because it invalidates them. Every gate in this file ultimately
reports a **verdict**, and a verdict can be corrupted by the plumbing carrying it while still
looking exactly like a pass. Four instances turned up in one day of work on this document, two
of which corrupted a verdict rather than merely truncating output:

| mode | what it looks like | the tell |
|---|---|---|
| **masked exit code** | `cmd \| tail -5` reports the *pipe's* status, not `cmd`'s — always 0 | read the command's own output for its failure text, or use `PIPESTATUS` / drop the pipe |
| **truncated output** | `\| head -8` shows a clean prefix of a failing run | a cap has no error condition, so "nothing bad in the first N" is not "nothing bad" — state the denominator |
| **`grep` dropping input** | the repo's `grep` wraps `ugrep -I`, which discards binary-looking stdin, so `git show <rev>:<f> \| grep <s>` finds nothing for strings that are present | use `command grep` when piping, and pair every negative claim with a positive control |
| **stale artifact** | a gate passes against a binary or tree built before the change | rebuild, or assert a freshness token (`ensure_fixtures_fresh`, `common/mod.rs:124-137`, is the model) |

Worked instance, from this document's own work: `cargo clippy … | tail -5` reported **exit 0**
while clippy had actually died on `signal: 15` (a disk-guard kill). The 0 was `tail`'s. It was
caught only by reading the full output file — and it happened inside the PR fixing a
silent-success bug. **A masked exit code and a passing check are indistinguishable at the point
of use**, which is the same property that makes every row in this document worth writing down.

### P1 — Does the guard count the same collection the comparison loop consumes?

Name the collection the floor measures and the collection the loop iterates, and check they are
the same object. Where they differ, the guard is satisfied by a population the comparison never
sees.

| gate | guard measures | loop consumes | same? |
|---|---|---|---|
| corpus `verify.mjs` | `manifest` ≥1000 (`:205`) **and** ≥99% with outputs (`:224`) | `manifest` (`:284`,`:318`) | **yes** — and `hasOutputs` explicitly bridges manifest→tree |
| `svelte2tsx-verify.mjs` | component `manifest` ≥1000 (`:86`) | `manifest` (`:102`,`:162`), plus a per-entry presence check (`:176`) | **yes** — an absent tree scores `missing`, not `match` |
| `check-verify.mjs` | scenarios > 0 (`:179`) | scenarios | **yes** (its blind spot is elsewhere: no diagnostic floor) |
| **`fmt-verify.mjs`** | `included.length` from `fmt/meta.json` (`:69`) | files read from `fmt/oracle/` (`:95`), `continue` when absent (`:97`) | **NO** → #2447 |
| **`css-prune-sweep.mjs`** | *nothing* (`:482` is a `console.log`) | generated `cases` | **NO** → #2445 |
| **`lint-verify.mjs`** | `files.length === 0` (`:163`) | oracle gets `files` (`:178`); **rsvelte gets the whole `SOURCES` dir** (`:124`) | **NO** — two populations inside one comparison; this is the mechanism of blind spot 11a |
| **`ast_gate_preconditions.rs`** | `files.len() > 1000` on *discovered inputs* (`:57`) | only successfully-**compiled** files (`continue` at `:90`) | **NO** → blind spot 15a; the difference is unmeasured |
| **`matrix/run.mjs`** | *nothing* — `cases.length` is printed at `:84`, never asserted | generated `cases` | **NO** — same shape as #2445 |
| `svelte2tsx_fixtures.rs` | `total_tested >= 254` (`:155`), derived from the loop itself | same | **yes** |

**5 of 9 fail**, two of which (`matrix/run.mjs`, and the `lint-verify.mjs` framing) this predicate
found rather than a full read.

**Companion tell, and it *is* greppable: asymmetric handling of symmetric inputs.** In
`fmt-verify.mjs`, `oracle === null` is skipped silently (`:97`) and `actual === null` fails
loudly (`:98-101`) — two lines apart. Two sides of one comparison should fail the same way;
when they do not, one of them was written while thinking about a different question.

### P2 — Does the script accept a subset selector *and* a baseline-writing flag, and refuse the combination?

`--update-baseline` rewrites the ratchet from what the run measured, so combining it with a
selector deletes every entry outside the selection. Two greps, binary answer.

Denominator: **1087 tracked `.mjs`/`.rs` files scanned; 5 accept both.**

| script | selector | writer | refuses? |
|---|---|---|---|
| `check-verify.mjs` | `--scenario` | `--update` | **yes** — `:100` `if (UPDATE && ONLY) fail('--update cannot be combined with --scenario')` |
| `check-e2e-verify.mjs` | `--project` | `--update` | **yes** — `:115`, same shape |
| **`matrix/run.mjs`** | `--families`, `--targets` | `--update-baseline` | **PARTIAL — 2 of 3 axes.** Refuses `--no-fmt` (`:184`) and the `--families` subset (`:188-189`, naming FALSE-SHRINK explicitly). Does **not** refuse `--targets` |
| `verify.mjs` | `--targets` | `--update-baseline` | **scopes instead of refusing** — `UPDATE_SCOPE` (`:104-112`, `:182`) writes only the measured targets, plus `requireFullCorpus` (`:164-172`). A valid alternative |
| **`css-prune-sweep.mjs`** | `--filter` (`:52`, applied `:324`) | `--update-baseline` (`:57`, `:476`) | **NO** — the write is unguarded |

**Corrected count: 2 unguarded holes of 5, not 1.** An earlier revision of this table scored
`matrix/run.mjs` as guarded because it refuses *something*. It refuses `--families`; `--targets`
narrows the same population and is not refused. `ids` (`:180`) is built only from the selected
`TARGETS` (`:52`), and `:193` then writes the **whole** baseline from it — so
`--targets client --update-baseline` deletes every `server` and `client-dev` entry. **[D]**
Observed by another agent against a redirected output path: **350 entries → 50, 300 deleted
(86%), exit 0.**

### Why this one is the argument for a shared helper

Not the count — two of five is weak evidence on frequency. The mechanism is the evidence, and
`matrix/run.mjs` proves it inside a single file:

- the **write** path (`:182-196`) narrows on families only;
- the **compare** path (`:203-208`), fifteen lines below, narrows on
  `measuredFamilies.has(family) && measuredTargets.has(target)` — **both** axes;
- and the comment introducing it (`:200`) says *"Only entries in the families this run
  measured"*, naming one axis while the code beneath it handles two.

The author was not unaware that `--targets` narrows the measured set; they wrote
`measuredTargets` at `:202` and used it at `:207`. The knowledge was present in the file and did
not reach the guard fifteen lines up. Compare the population across the repo:
`mutate-corpus.mjs` refuses all four of its axes, `matrix/run.mjs` 2 of 3, `verify.mjs` 0 of 1
(it scopes instead). These are **incomplete copies of one rule, each missing the axis its author
happened not to be holding in mind** — which is a failure mode education cannot reach, because
the person already knows the rule. A structure that makes the write path consume the same
narrowing set the compare path uses can; a reminder cannot.

**The trap in the loose version of this check** — and it is the same shape as the
misclassification above. Grepping `refus|exit\(2\)` reports `css-prune-sweep.mjs` as guarded,
because those tokens occur elsewhere in the file; it also reports `matrix/run.mjs` as guarded,
because it genuinely refuses a *different* axis. The proxy answers *"does this file contain
refusal machinery"* when the question is *"does it refuse **this**"*. The predicate is only
meaningful when the refusal's **condition references the selector variable in question** — per
axis, not per file.

## Every performance gate we own points at the runes end of the population

**This is a gate-coverage finding, not a perf finding.** The output-equality gates above are
scoped by *what they compare*; the performance gates are scoped by *what population they
compile*, and that scoping has never been written down. Measured 2026-08-08:

| population | legacy by files | legacy by bytes |
|---|---|---|
| CodSpeed benchmark fixtures | — | **8 of 9 are runes** |
| library corpus (`submodules/`, 23 repos) | 3.65% | **12.34%** |
| **application source** (huly / open-webui / carbon / SMUI) | **46.74%** | **68.89%** |

Per application repo: huly 74.9%, open-webui 70.3%, carbon 87.9%, SMUI 0.00%.

The cost of the instance-script text machinery is a property of that split, not a constant.
`process_accumulated` as a share of **total compile**, measured per repo:

| repo | population | `$:` stmts | process_accum | line_scan |
|---|---|---|---|---|
| shadcn-svelte / bits-ui / skeleton / layerchart | library, runes | 0 | **1.0–1.7%** | 0.8–1.3% |
| **SMUI** | application, **0.00% legacy** | **0** | **2.1%** | 1.7% |
| svelte-heroicons | library, `export let`-only | 1 | 12.1% | 1.8% |
| smelte / sveltestrap / svelte-ux | library, legacy | 97–196 | 16.1–26.6% | 0.8–1.4% |
| **huly** | application | 3312 | **22.5%** | 1.2% |
| **open-webui** | application | 577 | **25.7%** | 1.1% |
| **carbon** | application | 765 | **30.2%** | 1.5% |

**So the gates are aimed at the 1–2% end of a 1–30% range**, and the population that determines
real compile volume sits at the other end. A change that removes most of `process_accumulated`
would read as **flat on CodSpeed and nearly flat on the library corpus**, while being worth
~22–30% on application source. The reverse also holds: a regression confined to the legacy path
is invisible to every perf gate we run.

**SMUI is the load-bearing control here.** It is application source and it is 0.00% legacy by a
source-level marker; its `process_accum` is 2.1%, sitting with the runes libraries rather than
with the other three applications. Marker and timer agree, so the split above is tracking the
legacy/runes axis and not merely "applications are different from libraries".

**What is still unmeasured `[U]`:** whether the four application repos are representative of
application Svelte generally. They were chosen because prior work already cited them, which is a
selection this document cannot justify. Aggregating them gives **22.8%**, but huly alone is
**55.8% of that corpus's compile time**, so the aggregate is a statement about how the corpus was
assembled. (Excluding huly moves it only to 23.3%, so the aggregate is at least not fragile to
that one repo — but four repos is four repos.)

## Adding a gate, or a row here

When you add a gate, add its row **before** the ratchet is first baselined, and answer the
question this document exists to force:

> **What does this gate not look at?**

Not "what inputs does it not have" — that is corpus size, and it is the saturated axis. Ask
which *fields* of the compared objects the comparison key drops, which *normalization* runs
before the diff, and which *population filter* the unit passes through. Until #2281 the corpus
pipeline discarded `result.warnings` entirely, so that whole class was invisible by
construction, at any corpus size — which is how #2256 shipped while the corpus scored the very
entry that reproduces it as `MATCH`.

If you cannot answer with a discriminating case or a file:line citation, write `[U]` and say
what would resolve it.
