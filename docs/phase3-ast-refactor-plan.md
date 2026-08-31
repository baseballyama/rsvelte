# Phase 3 refactor: from string surgery to an AST → printer pipeline

> ## ★★★ 2026-08-08 訂正: 「script 印字の AST 移行」は残作業ではない ★★★
>
> **client の script 印字は既に AST + esrap である。**
> `js_ast::to_oxc` は `JsStatement::Raw` をそのまま出力せず、
> `parse_chunk`（`to_oxc.rs:1269`）で **oxc AST に再パースし esrap で印字**する。
> フォールバック理由 `chunk-parse` は、その**再パースの失敗**を指す名前であって
> 「テキストのまま印字した」という意味ではない。
> 実測フォールバック率は **bits-ui 2.59% / flowbite 3.86%**（＝ 96〜97% は AST 印字）。
>
> **したがって残っているのは印字側ではなく「変換側」** —
> `line_loop` と前段（prenormalize / collect_vars）が依然テキストを操作している。
> **この 2 つは規模も難度も桁違いなので、名前で取り違えると
> 「もう終わっている作業」の見積りが出続ける。**
> 本文書で「印字を AST 化する」と読める箇所は、
> **すべて「変換を AST 化する」と読み替えること。**
>
> 付随して確定した数値（実測、n=5 コーパス）:
> - Phase 2 の span が `line_loop` まで生き残る率 ＝ **72.40%〜99.47%（母集団依存）**。
>   「89.5%」という単一定数は**存在しない**。
> - 阻害要因は母集団で入れ替わる: **ライブラリは `arrow_parens` 単独**
>   （bits-ui は 167 件全部）、**アプリは `rehome_reactive_statement_comments`**
>   （carbon 37 / open-webui 34、ライブラリ 3 コーパスでは **0 件**）。
> - **アプリ側の解除は reactive-statement 移行に依存する**。
>   `rehome` は印字の産物ではなく、upstream が `$:` を
>   `legacy_pre_effect` に作り替えることの模倣だからである。
>
> 詳細と一次データは `ast-refactor-handoff.md` §10。

## Why

Phases 1–2 are in decent shape (real template AST, oxc for JS, scope
tree). Phase 3 (transform) is not presentable to a compiler audience in
its current form: large parts operate on **source text**, with the final
output assembled from string fragments and then patched by post-passes.
This is the root cause of an entire class of corpus divergences (comment
placement, quoting, number spelling, blank lines) and of past bugs like
byte-index panics on multi-byte chars.

Symptoms in today's tree (inventory 2026-06-11):

| smell | where | size |
|---|---|---|
| lexical keyword/paren scanning over raw script text | `server/transform_script.rs` (`wrap_derived_reads*`, `remove_rune_statement`, `compute_shadow_ranges`, `mask_nested_reactive_labels`), `server/helpers.rs` (`contains_await`-style byte scans), `shared/async_body.rs` (`compute_blocker_map(raw_script)`) | ~10k lines |
| string post-passes patching oxc_codegen output back toward esrap form | `client/formatting.rs` (`restore_original_quotes`, `restore_number_literals`, `restore_block_comment_alignment`, `add_esrap_blank_lines`), `server/build.rs` (`strip_arrow_function_parens`, `normalize_script_with_oxc`, `protect_dangling_comments`, hex-encoded comment smuggling) | ~4k lines |
| `$`-prefix store-subscription detection by char scanning with positional heuristics (`is_dollar_ident_parameter` etc.) instead of scope analysis | `2_analyze/store_subscriptions.rs` | 1.3k lines |
| half-structured output IR: `JsStatement`/`JsNode` with `Raw(String)` escape hatch used in 30 files | `3_transform/js_ast/` + all visitors | — |
| comments handled per-pass (each fix re-anchors them differently) | everywhere above | — |

Upstream's architecture is simple by comparison: visitors build an output
**ESTree AST** (with `b.*` builders), and **esrap** prints it once, with a
single position-indexed comment stream. Everything rsvelte patches in
post-passes falls out of that design for free.

## Target architecture

```
template AST + analysis
        │  (visitors — port of upstream 3-transform, structure preserved)
        ▼
output JS AST  =  oxc_ast::Program built via oxc_allocator (arena)
        │          + side table: comments (span-anchored), raw literals
        ▼
rsvelte_esrap printer  =  Rust port of esrap's `languages/ts` printer
        │  (quotes, number raw, comment flush, sequence/body margins)
        ▼
output string (+ sourcemap from printer location commands)
```

Key decisions:

1. **Output AST = oxc AST**, not the bespoke `js_ast::JsNode`. We already
   depend on a pinned unified oxc rev; oxc's arena + builders
   (`oxc_ast::AstBuilder`) are the Rust equivalent of upstream's `b.*`.
   Literal nodes must carry `raw` (oxc does) so the printer can preserve
   source spelling exactly like esrap.
2. **Print with a Rust port of esrap**, NOT `oxc_codegen`. oxc_codegen's
   output style (minified numbers, no margins, different comment policy)
   is what forced today's post-passes. esrap's `languages/ts/index.js` is
   ~2.4k lines of straightforward visitor code — port it 1:1 (`sequence()`,
   `body()`, `flush_comments_until`, margins, `EXPRESSIONS_PRECEDENCE`).
   An earlier in-repo experiment (`3_transform/shared/respace.rs`, deleted
   in `06450adb`; recoverable from git history) already validated the
   margin rules in Rust against the corpus.
3. **One comment stream.** Comments come out of Phase 1 (oxc trivia +
   template comments) as a position-sorted `Vec<Comment>`; the printer
   owns flushing them. Transform passes never copy comment text around.
4. **Script transforms walk the parsed oxc AST** (`oxc_ast_visit`) instead
   of scanning text: derived-read wrapping, rune statement removal, store
   `$x` resolution (scope-accurate — kills `store_subscriptions.rs`
   heuristics), blocker-map/await analysis (replaces
   `compute_blocker_map(raw_script)`).

## Migration plan (each step is a normal PR; the corpus baseline +
fixture suites are the safety net — output must stay byte-identical, so
every step is verifiable by `verify.mjs --strict` deltas staying at zero
regressions and the baseline only shrinking)

The steps are ordered so each is independently landable and Sonnet-class
executable: clear inputs, an oracle, and a mechanical definition of done.

### Step 0 — printer: port esrap to `crates/rsvelte_esrap` (≈1–2 weeks)
- Input: `submodules/svelte/node_modules/.pnpm/esrap@2.2.11*/…/src/`
  (`index.js` command buffer, `context.js`, `languages/ts/index.js`).
- Port the command-buffer model (`margin/newline/indent/dedent` consts,
  nested command arrays, measure()) and the TS-language visitor over
  **oxc AST** input. Skip TS-only node kinds initially (output is plain JS).
- Unit-test by golden comparison: for every file in
  `compat/corpus/expected/**/client.js` (already esrap-printed by the
  official compiler), parse with oxc and re-print with the port; assert
  byte-identity. That corpus IS the printer's conformance suite — no new
  fixtures needed.
- Done when: ≥99.9% of expected outputs round-trip byte-identically
  (track exceptions in a list; they indicate unported esrap rules).

### Step 1 — comment stream end-to-end (≈3 days)
- Phase 1 already forwards oxc comments into `Root.comments`; extend to a
  single sorted `Vec<Comment>` handed to the printer.
- Wire `getLeadingComments`-equivalent for synthesized nodes (the few
  places upstream attaches comments explicitly).
- Done when: printer round-trip from step 0 still holds with comments on
  (expected outputs include comments, so this is covered by the same
  golden test).

### Step 2 — server script transform on AST (≈2 weeks, biggest win)
- Replace `server/transform_script.rs` text passes with an
  `oxc_ast_visit::VisitMut` (or rebuild-via-AstBuilder) pipeline:
  derived/state/props lowerings, `$effect` removal, `$inspect` →
  console.log, store-sub `$x` → `$.store_get`, assignment lowering.
  Mirror upstream `server/visitors/*.js` file-by-file — the JS sources
  are the spec; most functions are <50 lines.
- Scope-accurate `$x` resolution comes from Phase 2's scope tree (the
  binding for `x` + locality of `$x`), deleting the char-scan heuristics
  in `store_subscriptions.rs` (keep its synthetic StoreSub creation,
  driven by AST references instead).
- Print via rsvelte_esrap; delete `normalize_script_with_oxc`,
  `protect_dangling_comments`, comment hex-smuggling, `format_js_line`.
- Done when: ssr + runtime + snapshot fixture suites green and corpus
  baseline does not grow (it should shrink — several known failures are
  artifacts of the old passes).

### Step 3 — client template body IR → oxc AST (≈2 weeks)
- `js_ast::{JsStatement,JsNode}` currently mixes structured nodes with
  `Raw(String)`. Replace with oxc AST construction in the client
  visitors; expressions that today pass through as source text get parsed
  once (they already were parsed in Phase 1 — thread the existing
  expression AST instead of its source slice).
- Delete `client/formatting.rs` post-passes (`restore_*`,
  `add_esrap_blank_lines`, `collapse_to_single_line`) — the printer
  makes them meaningless.
- Done when: client fixture suites + corpus hold; `js_ast/` is removed or
  reduced to thin helpers over `AstBuilder`.

### Step 4 — async blocker analysis on AST (≈1 week)
- `shared/async_body.rs::compute_blocker_map` re-derives blockers from raw
  script text; Phase 2 already computes await/blocker metadata. Unify:
  one analysis, stored on bindings/statements, consumed by both targets.
  (Memory note `feedback_has_call_semantics` applies: Phase 3 needs the
  broad "any CallExpression" notion — keep the two semantics distinct.)

### Step 5 — cleanup + hardening (≈3 days)
- Delete dead text helpers (`helpers.rs` byte scans, `skip_string_literal`
  & co.) once nothing references them.
- `grep -rn "JsStatement::Raw\|JsNode::Raw"` must return zero outside the
  printer's raw-literal support.
- Add a CI guard: a `#[deny]`-style lint or a simple grep check in CI
  that fails when new `Raw(` constructions are introduced in visitors.

### Non-goals
- Changing public APIs (NAPI/wasm signatures stay).
- Sourcemap redesign (the printer's location commands feed the existing
  map builder; parity with today's maps is enough).
- Performance regressions: benchmark (`pnpm run generate-benchmark`,
  codspeed CI) before/after each step. Arena-built AST + single print
  should be *faster* than today's parse→print→re-parse→patch chains; if a
  step is slower, profile before landing (see `perf-loop` skill, §7).

## Ground rules for every step

- Upstream JS source is the spec; keep module structure mirrored so
  file-level diffs against `3-transform/**/*.js` stay reviewable.
- Byte-exactness is enforced by existing suites — never weaken a fixture
  or grow `compat/corpus/known-failures.json` to land a refactor step.
- No new string post-passes. If output is wrong, the AST or the printer
  is wrong — fix it there.
- Each step lands as its own PR with the corpus counts in the description.

## Findings (2026-06-19 — derived-read wrapping is single-pass-or-nothing)

A session of corpus burndown (#1092, 248→120 known failures) probed how far the
*current textual* pipeline can be pushed and surfaced the precise reason the
`$derived` server lowering must be migrated holistically, not pass-by-pass:

- **Instance/module script `wrap_derived_reads` is already AST** (`server/
  derived_reads_ast.rs`) and was extended to wrap a derived used as a 0-arg
  callee uniformly (`inactive()` → `inactive()()`) — fixing the long-standing
  `$derived` **currying** class on the instance side **with zero regressions**.
  This proves the AST approach is the correct, safe mechanism (the textual
  scanner could never do this — see below).

- **Template-expression derived wrapping cannot be swapped to the AST pass in
  isolation.** `wrap_derived_reads_for_template` runs *late*, on text that has
  already been through other textual transforms (store `$x` → `$.store_get`,
  special-var rewrites) **and, critically, on text where some derived reads are
  already wrapped to `name()` by an earlier stage**. The byte scanner's
  "skip a derived in 0-arg call position" rule is therefore **load-bearing for
  idempotency**, not just a currying quirk: it prevents `code()` (an
  already-wrapped read) from becoming `code()()`. Routing the template path
  through the AST pass (which wraps uniformly) double-wraps those reads and
  regresses ~220 corpus entries. The decisive observation: a source-level
  `derived()` (currying — must become `derived()()`) and an already-wrapped
  read `derived()` (must stay) are **indistinguishable** to *any* pass —
  textual or AST — once the input is partially transformed.

- **Conclusion / required approach.** The derived/store/special-var lowerings
  must run **exactly once, over the raw parsed expression AST**, before any
  text-stage rewrites — i.e. Step 2/3 must rebuild the template-expression
  (and script) handling as a single AST transform that emits already-correct
  output, rather than the present multi-stage idempotent text passes. There is
  no safe incremental "swap one text pass for an AST pass" for the template
  path; the multi-stage text wrapping has to be replaced wholesale by the
  single-pass AST pipeline. Treat the 84 `wrap_derived_reads`/
  `transform_store_refs` call sites as one transform to consolidate, not as
  independently-portable units.

## Findings (2026-08-08 — the allocate/copy/hash bucket is the representation, not a site)

A samply profile had attributed 40.3% of non-kernel CPU to allocation (18.1%),
hashing + maps (11.2%) and memcpy/memset (9.4%), by *symbol family*, which named
no code. This attributes it by **site**, using
`crates/rsvelte_devtools/src/bin/alloc_sites.rs` — a global-allocator wrapper over
mimalloc that samples 1-in-N allocator *events* (not timer ticks, so the result is
deterministic and does not move with machine load; everything below was measured at
load 36–60). Per sampled event it records the requested size, the bytes
`realloc`/`alloc_zeroed` must copy, and an unsymbolised stack, keeping sizes per
class so a cost model is applied offline rather than baked in.

### rsvelte performs ~1.2 heap allocations per input source byte

| corpus | files | mean B | events/file | **alloc/src-byte** | copied B/src-byte |
|---|---|---|---|---|---|
| huly plugins | 2123 | 3356 | 4316 | 1.286 | 33.5 |
| open-webui | 650 | 5558 | 6881 | 1.238 | 42.0 |
| carbon | 287 | 3281 | 4483 | 1.366 | 41.9 |
| SMUI | 449 | 2118 | 2505 | 1.183 | 38.7 |
| huly, files ≤1.5 KB | 573 | 1058 | 1157 | **1.094** | 21.9 |
| huly, files ≥12 KB | 54 | 19176 | 20970 | **1.094** | 38.4 |

Flat to three digits across an 18× file-size range. This is the first *mechanism*
for "uniformly heavy, slope not intercept" (187.6 ns/byte vs the competitor's 72.7,
p10/p50/p90 ratio 1.77/2.35/2.55): the allocator load is a pure slope in input
bytes. A 3 KB component performs ~4,000 heap allocations.

### No site is worth fixing — the bucket is flat

Top sites as % of the bucket, mean of the four corpora: `JsNode::to_value` 6.21,
`transform_instance_script_for_visitors::{closure}` 3.99, the same function 2.62,
`state_reads_ast` 2.31, `transform_client_with_visitors` 2.29, `declare_binding`
2.22, `esrap/printer.rs:2922` 1.75, `create_identifier` 1.72. There are **322–479
distinct sites per corpus and it takes 26–32 of them to reach half the bucket.**
The largest single site is **0.4–1.8% of compile** — under the ~5% code-layout
floor for a separate-binary A/B. **Do not open a brief to fix a site here.**

### The identified target is the representation

One `Box` per expression node (`Expression::from_node` is
`Box::new(TypedExpr::new(node))`), and — because `serde_json` is built with
`preserve_order` — every `Value` object key is a fresh `String` malloc plus an
`IndexMap` slot plus a SipHash, drawn from a set of only **88 distinct static keys**
(no dynamic keys on this path). Two independent instruments — an allocator-event
sampler and an object/entry counter, sharing no assumption — agree on the magnitude
across three corpora:

| corpus | allocations at the site | objects | **per object** | map entries | **per map entry** |
|---|---|---|---|---|---|
| huly | 635,202 | 71,293 | **8.910** | 356,896 | **1.780** |
| carbon | 122,291 | 13,790 | **8.868** | 67,522 | **1.811** |
| open-webui | 136,305 | 15,452 | **8.821** | 77,191 | **1.766** |

1.0% spread on per-object, 2.5% on per-entry. The per-entry figure is the
mechanistically meaningful one: **~1.78 allocations per map entry is exactly what
`preserve_order` predicts** — one `String` malloc for the key plus ~0.78 amortised
`IndexMap` table/vec growth — and it had no freedom to land there by accident. This
is the only identified item whose magnitude is the right order. **It needs its own
scoping; do not start it from this doc — but start the next brief here rather than
re-deriving it.**

The producer is a single function. `to_value`'s row above is a roll-up (limit 1
below); on legacy-`$:` corpora it resolves almost entirely to
`instance_labeled_statements_json` (`2_analyze/mod.rs`), which serialises every
top-level `LabeledStatement` in the instance script. Measured inclusively from the
allocation side it is **84.7% / 91.5% / 36.0% / 0%** of all `to_value` allocation on
huly / carbon / open-webui / SMUI — the counter's independent object shares are
77% / 82% / 34% / 0%. **SMUI is a clean zero on both instruments**, so this is gated
on legacy `$:` density, not on component size.

### FxHash probe: a lower bound on the key-representation fix, not a rejected optimisation

Vendored `serde_json` with `IndexMap`'s hasher swapped SipHash→FxHash; paired
alternating A/B, 8 rounds, `compile_profile`, LTO off:

| corpus | base | fix | delta | wins |
|---|---|---|---|---|
| huly | 1384.8 ms | 1328.3 | **−4.08%** | **8/8** |
| SMUI | 152.6 | 147.0 | −3.65% | 7/8 |
| open-webui | 717.4 | 712.4 | −0.70% | 6/8 |
| carbon | 203.0 | 202.8 | −0.12% | 5/8 |

Not shipped: it sits inside the layout floor and costs a permanently vendored
`serde_json`. **Read this as a lower bound on the representation fix, not as
"hashing: settled."** It measures *SipHash minus FxHash* only — FxHash still hashes
the bytes, and the malloc per key and the `IndexMap` slot are untouched. A
representation that removes all three is strictly better than what was measured.

### Four limits of the instrument, stated as limits

1. `clean()` strips generics, so a trait-impl symbol (`<JsNode as Serialize>::serialize`)
   reduces to `::serialize`, fails the `starts_with("rsvelte")` test and is dropped.
   The `to_value` row is therefore an **inclusive roll-up of the serialize subtree,
   not a leaf**, and the same effect pushes attribution outward table-wide.
2. It sees map-growth *allocation* (0.6–6.0% of the bucket), never SipHash
   *compute*. Most of the 11.2% hashing bucket is structurally invisible to it.
3. The time column's calibration (6.4–7.4 ns/event) is a **warm-cache lower bound**;
   the in-situ cost is ~4× higher.
4. The top 2–3 rows are stable across four cost models and both size bands. The
   **tail ordering is not stable and is not claimed** — under a copy-dominated model
   `declare_binding` moves #5→#1.

### A retraction worth reading: the circular triangulation

The first version of this finding reported the top site as "~2.5% of non-kernel CPU".
That number was wrong twice. It multiplied a share of the *allocation+copy* bucket by
**40.3%**, which includes the 11.2% hashing bucket the instrument cannot see (≤27.5%
is the correct multiplier). Worse, it then applied a 4× "in-situ" amplification
**derived by assuming samply's 18.1% allocator share — the very quantity being
apportioned** — and presented the result as if two measurements had triangulated.

A chain that derives its own amplification factor from the quantity it then
apportions will look like rigour to everyone who reads it, **including its author**.
The tell is that the conclusion cannot move: no measurement could have refuted it,
because the input and the output were the same number. When converting a
within-bucket share into a share of total time, the bucket's absolute size must come
from somewhere the share did not.

## Findings (2026-08-08 — dev-mode client: two falsified hypotheses, and the one bucket that scales)

An attribution pass over the **dev-mode client** target (`compile_profile --dev`)
on six real-world corpora: carbon (1,267 files), huly (2,498), open-webui (650),
SMUI (449), flowbite `src/lib` (183), shadcn-svelte (1,682). **Nothing was
changed** — both candidate fixes were killed at thresholds fixed before the data
existed. What follows is what the next person should not have to rediscover.

### The `script_text` scaling exponent (the durable result)

`compile_profile` fits log(bucket time) on log(script bytes) per file. On huly
(2,498 files, 2,454 fitted points):

| bucket | share | exponent | share x exp |
|---|---|---|---|
| ensure_script | 7.1% | 0.865 | 0.061 |
| Analyze | 23.3% | 0.988 | 0.230 |
| **script_text** | **36.6%** | **1.395** | **0.511** |
| template | 10.7% | 0.680 | 0.073 |
| js_codegen | 9.1% | 0.822 | 0.075 |

Dev mode is the same picture (script_text 39.6% share, exponent 1.242).

`script_text` is the **only** bucket whose exponent is above 1.0 while every
sibling is clearly below it, and it is simultaneously the largest share — so it
carries ~0.51 of a total ~0.95 in the `share x exp` column, i.e. **roughly half
of how compile cost grows with file size lives in one bucket**, and the
per-statement line loop is most of that bucket. This holds in **prod as much as
dev**, so it is an argument for the line-loop work independent of dev mode.

Claim it at that precision and no finer: "clearly >1 while every sibling is
clearly <1". It is fitted on time, so machine load affects it (load hits all file
sizes about alike, which is why the exponent survives and the absolute ms do
not). Quote the exponent fitted over 2,454 points, **not** the Q1..Q4 `ms/f`
cells printed beside it — those are visibly noise-corrupted on a loaded box
(Q2 > Q3 in several rows).

### Falsified: the `Vec<char>` rescans in `wrap_prop_mutation_validation`

`wrap_prop_mutation_validation` (`client/props_transforms.rs`, reached only in
dev because `prop_mutation_vars` is filled under `if dev`) collects the **entire
remaining program** into a `Vec<char>` at two sites, once per match. That reads
as a textbook `sites x source_length` defect, and a sibling defect in the same
function gave carbon-dev -37.7% in #2512. It is **not** hot.

Counter: bytes handed to those collects, over the program bytes the pass was
handed. Load-immune.

| corpus | calls | props | collects | collects/call | rescan factor |
|---|---|---|---|---|---|
| carbon | 566 | 3,017 | 173 | 0.3 | **1.1x** |
| SMUI | 131 | 790 | 71 | 0.5 | **0.6x** |
| open-webui | 555 | 2,164 | 609 | 1.1 | **1.8x** |
| huly | 2,246 | 8,903 | 3,076 | 1.4 | **1.6x** |
| flowbite | 182 | 1,496 | 97 | 0.5 | **0.8x** |
| shadcn | 603 | 1,523 | 2 | 0.0 | **0.0x** |

Pre-registered "≥10x if this is the defect". Observed **0.0–1.8x** — about one
pass. The loops reach a collect 0.0–1.4 times per call; they almost always exit
on the `memmem` find first. **Do not rewrite these scanners.**

Two observations that *look* like they confirm the hypothesis and do not:
`post_passes` grows from ~0 to 5.6–11 pp of total in dev on every corpus (but
see the bucket warning below — it has four causes), and the growth is large on
legacy-heavy corpora and small on runes-heavy ones (but
`transform_legacy_instance_dev_tail_ast` is gated on `dev && !analysis.runes`, so
legacy-ness selects the competing cause exactly as strongly).

### Falsified: skipping the dev assign-tail's whole-script parse

`transform_instance_dev_assign_tail` guards a whole-script parse on
`source_has_assignment` = `memchr(b'=')`. **That guard filters nothing and must
not be read as already-optimised**: `==`, `=>`, `<=` and every template
attribute contain `=`, so on carbon it admits 1,011 components of which **951
(94.1%) have no assignment site at all** and are parsed for an edit that provably
cannot be emitted — every edit in `collect_assign_edits` passes through
`sites.take(...)`, so an empty `AssignSites::collect(original)` guarantees zero
edits.

Skip rates: carbon 94.1%, SMUI 79.3%, flowbite 82.9%, shadcn 83.4%, open-webui
69.8%, huly 68.1%.

The skip works exactly as the code reading predicted — reparse driver calls on
carbon 4,987 → 4,036, a delta of **951**, precisely the skippable count. It buys
nothing. Paired A/B, **both arms in one binary** selected by an env var so code
layout is byte-identical between them (two builds would have differed by ~5%
layout alone, which is the size of the effect being measured):

| corpus | base | skip | delta | wins |
|---|---|---|---|---|
| open-webui | 2,842.9 ms | 2,844.1 ms | **+0.04%** | 4/8 |
| huly | 12,197.1 ms | 12,708.0 ms | **+4.19% slower** | 5/8 |

A cheaper probe cannot rescue it. On carbon — the most favourable corpus at 94.1%
skip — re-parse parse time between arms was 59.0 → 22.6 ms, ~36 ms against a
~1,000 ms compile, so **~3.6% with a free probe**, below the bar before the probe
costs anything. The line of attack is dead, not just this implementation of it.

### Instrument limitations (the sub-timers stay in the tree)

- **`post_passes` has four causes**: the shadowed-local post-pass,
  `wrap_prop_mutation_validation`, `transform_legacy_instance_dev_tail_ast` and
  `transform_instance_dev_assign_tail`. The last two are whole-script AST
  **re-parses** — a large constant — and the second is the O(n^2)-shaped
  candidate above. A movement in this bucket attributes to none of them on its
  own. Splitting it is what falsified the first hypothesis.
- **`line_loop` has two**: the per-line scanner and `process_accumulated`. A
  `line_loop` delta is most likely the latter; naming the scanner from it is the
  same error one level down.
- **Wall-clock is unusable on a loaded box, and the proof is a control that
  moved when it could not**: one paired round measured the `--dev` arm *faster*
  than prod, which is impossible by construction (dev runs passes prod never
  enters, and `post_passes` is 0.00% of prod). Supporting: carbon prod TOTAL over
  6 identical rounds spanned 2,523–3,747 ms (48%), against 651 ms for the same
  binary and corpus at load ~35. Use within-run bucket **shares** (a uniform
  slowdown divides out) or deterministic counters; contention is not perfectly
  uniform across buckets, so nothing finer than a couple of pp is readable.

### `rs_body` is not the prop-reads AST passes

`transform_reactive_statement` (`client/reactive_transforms.rs`) calls
`wrap_prop_source_reads_ast` at two sites. A re-parse multiplier there would show
as >1 reach per statement. Measured (counts and bytes are deterministic):

| corpus | `$:` stmts | site1 calls (/stmt) | site2 calls (/stmt) | site2 % of rs_body |
|---|---|---|---|---|
| carbon | 839 | 9 (0.01) | 200 (0.24) | 31% |
| open-webui | 714 | 3 (0.00) | 297 (0.42) | **1%** |
| huly | 3,802 | 17 (0.00) | 1,367 (0.36) | 24% |
| svelte-ux | 355 | 0 (0.00) | 79 (0.22) | 5% |
| smelte | 194 | 4 (0.02) | 36 (0.19) | 4% |

Both sites are reached **well below once per statement**, and account for 1–31%
of `rs_body` — so **69–99% of `rs_body` is elsewhere**. These two calls were the
right thing to check and the wrong answer. SMUI has **zero** `$:` statements and
cannot discriminate anything in this area.

Raw call counts are given alongside the rates on purpose. Site 1's rate rounds
to `0.00` on three corpora, which reads as "unreachable" — a different and much
more serious finding than "rare", since an unreachable branch is a defect rather
than an absence of headroom. The counts settle it: **9 / 3 / 17 / 0 / 4 — site 1
does fire, it is merely rare.** The distinction is not hypothetical here; the
`!t.ends_with("=>")` guard in this same file was cited in review as a deliberate
exclusion and never fires at all, because `"=>".ends_with('=')` is false. A rate
that rounds to zero cannot tell those two cases apart, so publish the count.

### The 6.59x four-target figure stands un-refreshed

The head-to-head table against `@mrwaip/svelte-rs` (client prod 4.07x, server
prod 3.05x, server dev 3.56x, **client dev 6.59x**) predates #2511 and #2512 and
was **not** re-measured here. It needs two processes (never load two native
addons into one — allocator clash, SIGSEGV), which is exactly what contention
corrupts; load ran 34–65 on 10 cores for the whole session and never dipped. Do
not quote 6.59x as current.

## Findings (2026-08-08 — the `to_value` cost is one site, and it is not the lazy cache)

> Read alongside the same-dated section above, whose title says the opposite. It is not a
> contradiction: that one asks which **site** owns the alloc+hash+memcpy bucket of total
> compile and correctly answers *none*; this one asks where the JSON **objects** come from.
> The answers interlock — that section prices one object key (`String` malloc + `IndexMap`
> slot + SipHash, from 88 distinct static keys), and this section names what emits the keys.

**The part of `JsNode` → `serde_json::Value` worth attacking was
`instance_labeled_statements_json` in `2_analyze/mod.rs` — not the lazy JSON cache
that #2510 / #2570 / #2576 optimized.** #2622 has since ported that site and its
three legacy-`$:` consumers to typed traversal, so the numbers below describe the
tree *before* it; they are kept because the reasoning that located the site is the
reusable part, not the count.

`JsNode::to_value` has **54 call sites**. One is the lazy cache in
`TypedExpr::as_json`; the other 53 bypass it. Every materialization figure this
project has ever quoted — the 27,488 → 12,089 → 3,649 series — counts *only* the
cache, because `MATERIALIZATIONS` increments inside the cache's `record()`. The
bypassing population was never measured. When it was, 98% of it turned out to be
a single site.

Per-site attribution from inside `to_value` (deterministic; identical across runs):

| corpus | cache calls | cache objects | `mod.rs` `$:` site calls | its objects | its share of all objects / map entries |
|---|---|---|---|---|---|
| huly/plugins | 3,649 | 21,016 | 3,303 | **71,293** | **77.0% / 77.2%** |
| carbon | 899 | 2,756 | 725 | **13,790** | **81.7% / 82.1%** |
| open-webui | 4,998 | 26,627 | 587 | **15,452** | **33.6% / 33.4%** |
| SMUI | 973 | 5,828 | **0** | **0** | **0%** |

All remaining direct sites combined are 70 calls / 306 objects on huly. Noise.

Confirmed independently by an allocator-event sampler (1-in-64, inclusive
attribution) that shares no assumption with the object counter: **8.91 / 8.87 /
8.82 allocations per object** on huly / carbon / open-webui, and 1.78 allocations
per map entry on huly — which is what `preserve_order` predicts (`serde_json::Map`
is an `IndexMap`, so every entry is a key `String` malloc plus amortised table
growth, and every entry is also a **hash insert**). The sampler puts the site at
84.7 / 91.5 / 36.0 / 0% of `to_value`'s allocation cost, the same ordering and
magnitude as the object share, consistently a few points higher because
allocations include the key strings an object count does not. The SMUI zero
reproduces as a zero on both instruments.

**Not a repeat-conversion problem — a cache is not the remedy.** The single
caller already serializes once and shares the result across all three legacy `$:`
passes (#2510 did that dedup). The remedy is porting the three consumers —
`check_reactive_declaration_cycles`, `populate_legacy_dependencies`,
`collect_reactive_statement_dependencies` — to typed traversal, which deletes the
entries outright rather than making each cheaper. One producer, three consumers,
no scope-dependent constant folder involved.

**Gated on legacy `$:` density.** The caller short-circuits on `analysis.runes`,
so this is ~80% of `to_value` on Svelte-4-era corpora (huly, carbon), a third on
open-webui, and exactly zero on runes-only code (SMUI). Legacy `$:` is 12.34% of
library bytes but 68.89% of application bytes, so the corpora this repo gates on
under-weight it — see `compatibility/GATES.md#gate-coverage` § C6. (The bench corpus is
**not** "8 of 9 runes"; fixtures 10-11 closed that gap and it is 37.7% legacy by
bytes.)

**No time share is claimed here, by either instrument.** A wall-clock timer over
all 54 sites spanned 5.07 / 2.89 / 0.58% of compile across three runs on
identical deterministic work (loaded machine); an allocator-model estimate was
retracted by its author for a circular correction factor. Both are recorded as
unresolved. Do not quote a percentage for this site without a new measurement.
A related probe — vendoring `serde_json` to swap `IndexMap`'s SipHash for FxHash
— measured huly −4.08% (8/8 paired wins), which sizes the *hashing* component but
was a separate-binary A/B. The historical timer probe did not characterise a
general code-layout floor: its tested timer layout and workload have since changed,
so it cannot bound this result. It was not shipped because it requires a permanently
vendored `serde_json`, and a new same-tree measurement would be required to price its
current performance effect.

### Two methodological rules this cost us

1. **Before trusting a per-function measurement, count the function's call
   sites.** A timer placed at one call site reports that site, not the function,
   and nothing in the output says so. `to_value` had 54; the instrument covered 1
   and under-reported by ~2x in calls and ~4x in objects.
2. **Attribute a memoised value by reader *set*, not first reader.** Under a
   per-node cache, `#[track_caller]` names only the first reader, so converting
   the site it blames moves the count by **zero** and the load shifts to a
   neighbour — it points at the wrong site, which is worse than being vague. Here
   it blamed `extract_metadata_from_tag` for 66.7% of materializations;
   converting it left the count unchanged and `expression_has_reactive_state`
   rose 1,933 → 20,264. Record the set of distinct callers per node (push into
   the node, flush on `Drop`); the reduction is the number of expressions for
   which *every* reader is eliminated. This generalises to any per-node cache
   here.

The sharpest illustration of both: #2510 replaced whole-instance-script
serialization with per-`$:`-statement serialization, won −20% on huly, and
reported cache materializations falling 27,488 → 12,089. All of that is true. It
also **created the largest single JSON producer in the compiler**, and the
instrument built to validate it could not see it.

Instrumentation for all of the above (per-site `to_value` attribution split
cache/direct, object and map-entry counts, reader sets) lives behind the existing
`measure-json` feature on branch `tools/measure-json-instrumentation`
(`e4f47227`), deliberately unmerged.

## Findings (2026-08-18 — the client map is span-carried, and all eleven passes delete)

#2954 rebuilt the client source map by matching generated text back against the
source, in eleven passes over `transform_component_with_scripts`. #3015 asks for the
opposite: stamp the source span on the IR node, let esrap emit the map from it, and
delete the passes. This section is the measurement.

**The denominator.** `sourcemap_gate_measure` scores 818 official segments across 29
samples, and **488 of them are client**; the other 330 belong to the server path, which
has its own passes and is untouched here. Quoting the whole 818 for a client-only change
understates it by a factor of ~1.7 — the issue's "239/818" is really 239/**488**.

| configuration | `main` | with this change |
| --- | ---: | ---: |
| all enrichment passes | 815/818 | 815/818 |
| every client pass disabled | 567/818 (**client 239/488**, 49.0%) | 749/818 (**client 421/488**, 86.3%) |

### Where the 182 recovered segments came from

| change | client segments |
| --- | ---: |
| identity chunk projection for non-TypeScript scripts | +57 |
| `JsBlockStatement::brace_span` — the component function's braces | +76 |
| `Synth::reserve_anchor` — those braces under split coordinates | +8 |
| esrap `map_position` — real source spans map under split coordinates | +10 |
| the identifier's span travels *into* the read transform | +6 |
| longest-run resync in the chunk projection | +25 |

**A span wrapper is not free where the consumer matches by variant, and the eighteenth
segment cost 49 runtime fixtures.** Keeping `JsExpr::Spanned` on a member expression's
*object* measured +18 and passed the whole source-map gate — and broke `component-binding-*`,
`binding-input-group-each-*` and 45 more, because the client lowering walks a member chain
with `while let JsExpr::Member(m) = root` and then asks `if let JsExpr::Identifier(name) =
root`. A `Spanned` in object position answers neither, so `shared/component.rs`'s
`member_root_info` came back `None` and a `bind:` setter silently fell through to a plain
`bar.baz = $$value` instead of `bar(bar().baz = $$value, true)` — output that parses,
computes a value, and loses the parent notification. The source-map gate cannot see this:
its unit is a segment, not the generated statement. So `without_outer_source_span` stays on
the member object, and the general rule is that **a new in-band wrapper variant is safe only
where every downstream matcher on that position has been enumerated** — the wrapper on the
identifier itself (`+6` above) is safe precisely because it is unwrapped at the single entry
point that consumes it.

**`has_loc` answers a comment question, and the printer was using it as a mapping
question.** Under split coordinates `loc_base` is set *above* every real source offset, so
`has_loc` is false for all of them — which is correct for "may this node carry comments"
and exactly backwards for "is this a source position worth a segment". Every
`JsExpr::Spanned` in a component whose script carries a comment was therefore dropped.
`Printer::map_position` is the same lookup without the `loc_base` gate, and only the
mapping sites use it; formatting decisions keep `offset_to_line_col`, because comparing a
comment-space line against a source-space line is meaningless.

**A brace is mapped from the body span, so a body that lives in comment space needs two
bytes of its own.** `write_block_brace` maps `{` to `[body_start, body_start+1)` and `}` to
`[body_end-1, body_end)`; when the body span is a chunk region those bytes belong to the
chunk and resolve to the chunk's offset. `Synth::reserve_anchor` appends buffer bytes that
belong to nobody and gives them their own `loc_map` entries. It reserves **two**, because
`write_node` brackets a mapped node with an anchor at each end.

### Deleting the passes (#3015 step 3), and what each one still carries

Segments lost when exactly one client pass is disabled, everything else on:

| pass | `main` | this change |
| --- | ---: | ---: |
| `default_function_wrapper` | 84 | **0 — deleted** |
| `effect_callback` | 8 | **0 — deleted** |
| `token` | 80 | **0 — deleted after the residual-owner audit** |
| `template_element_runtime` | 25 | **0 — deleted** |
| `legacy_prop_read` | 16 | **0 — deleted** |
| `inline_script` | 7 | **0 — deleted** |
| `bind_value` | 5 | **0 — deleted** |
| `component_bind` | 5 | **0 — deleted** |
| `verbatim_import` | 4 | **0 — deleted** |
| `collapsed_declaration` | 0 | **0 — deleted** |
| `rune` | 0 | **0 — deleted** |

`default_function_wrapper`, `effect_callback`, `template_element_runtime`, `legacy_prop_read`,
`inline_script`, `bind_value`, `component_bind`, `verbatim_import`, `collapsed_declaration`,
`rune`, and `token` are deleted: the positions that agree with official are now produced by
source spans,
and the before/after column is the attribution.
The wrapper keeps its block span in comment space and passes its two source-backed brace
positions separately to the printer, so comment placement no longer requires a fallback pass.
For element handles, `flush_node` records the tag-name span against the component-wide unique
generated name; both printers apply it to ordinary `Identifier` nodes only at emission time.
That keeps every lowering matcher on `JsExpr::Identifier` unchanged while reproducing
upstream's reuse of one located identifier for the declaration and all runtime uses. A
`bind:value` call similarly records a scope on its stable arena ID: only otherwise-unlocated
copies of the expression's root identifier inherit that span while the completed accessor call
is printed. Explicitly located children keep their own spans, and no wrapper enters the member
chain while lowering can still inspect it. Before its deletion, the token pass's remaining
generated positions came from two named lowering shapes rather than an unknown population:

| still carried by a pass | why the position is lost |
| --- | --- |
| `let x = $.prop($$props, …)` and its default | the declaration is written by the *script text* rewriter, which records nothing; the chunk projection has to re-derive it by alignment |
| the `(deps, $.untrack(…))` sequence tail | builder-made, with no source anchor |

Every row was a `Raw` fragment or a builder call that had a span available and dropped it —
i.e. #3015's step 1 really was the prerequisite it claimed to be, and this measurement named
which fragments to eradicate first by how many segments they held. After those carriers landed,
the current diagnostic found **32** generated positions owned only by token matching. Its
byte-identical-line oracle classified all 32 as incomparable, so that aggregate gate could not
justify retaining or deleting them. Decoding the pinned official maps independently showed that
the remaining heuristic positions were absent from official or attached to a different generated
token; none was an official segment reproduced by the pass. The client token matcher and its
priority partition therefore delete together. The server has a separate text-generated map and
is explicitly outside this client-only measurement.

Hoisted imports now pair the extractor's output with the phase-1 import declaration that produced
it. TypeScript erasure and import cleanup are applied only to prove the pair; the retained
declaration range supplies `RawMapped` token spans, so no generated-output/source line match is
needed.

**`rune` costs 0 on both trees, and that alone is not evidence it is redundant.** It was already
contributing nothing before this change, so deleting it cannot be attributed to the span work,
and the gate is 29 samples — a pass that never fires in those samples is indistinguishable from
a pass whose output is now produced elsewhere. The pass is deleted only after a separate
compile-level population fires all eight source/runtime pairs and pins both endpoints of every
generated runtime name to its rune. `collapsed_declaration` is likewise deleted only after a
compile-level regression deliberately fires its multiline-declaration predicate and pins the
generated client and server names to the source name. The distinction is recorded as
gate-coverage 14g.

### Two hazards the change created and paid for

*The projection stopped being TypeScript-only, so its consumers stopped being cheap.*
`RestoreRawMappedSpans::source_offset` was a linear scan of `copied_spans` per AST node and
`take_chunk_region` pushed one `loc_map` entry per mapped **byte** — both fine when only
TypeScript scripts had a projection, both quadratic once every script does. They are now a
binary search and one `LocRange { linear: true }` per copied run, and the projection itself
is computed only when `enable_sourcemap` is set.

*A resync window that is too wide is worse than the nearest-byte rule it replaces.*
Scoring resync candidates by longest common run over a 256-byte window fixed
`export let x = …` → `let x = $.prop(…)` and **broke** the TypeScript sample, which lost 4
segments the passes had been covering: a slightly longer run a hundred bytes away beat the
right one next door. The rule that holds is *nearest candidate that starts at least a
token's worth of agreement, within 32 bytes, and only when the nearest single byte buys
less than that* — 815/818 with the passes (no regression) and 767/818 without them, better
than the wide window's 756.

### A third hazard, and it is in the representation, not in a pass

The span-carrying architecture is cheap only if the span rides on something rare. Measured
with `alloc_count` on flowbite-svelte (1296 files) — a deterministic allocator counter,
because wall clock on the dev box moved **31% from run order alone** at load average 160,
which is why the three arms below are byte counts and not milliseconds:

| tree | allocations | requested bytes |
| --- | ---: | ---: |
| `main` | 2,120,446 | 578,635,400 |
| this branch, as first pushed | 2,124,328 | 592,917,695 (**+2.47%**) |
| after the three changes below | 2,125,314 | 581,451,429 (**+0.49%**) |

Generated JS **and** source maps stay byte-identical across 9,916 components (the four
real-world corpora, every `.svelte` in `submodules/svelte` + `submodules/svelte.dev`, and the
1,251 ` ```svelte ` snippets in their docs), so this is a pure representation question.

**`brace_span` on `JsBlockStatement` cost 11.0 MB of the 14.3 — 77% — for a range exactly one
block per program carries.** That struct sits inside every statement and expression, so the
field grew `JsStatement` 192 → 208 bytes and `JsExpr` 184 → 200: an 8.3% / 8.7% tax on the
whole IR. There is no cheaper field, either — `JsBlockStatement` is a bare `Vec` at 24 bytes
with 8-byte alignment, so *any* added field rounds it to 32. It belongs on `JsProgram`, keyed
by the component function's name, where there is one of it. **When a new field is only ever
set on one node, measure what it costs on the type, not on that node.**

The other two are smaller and are the same shape — work whose cost is paid per byte of every
script now that the projection is no longer TypeScript-only. `copied_spans_for_normalized_code`
built a `Vec<Option<u32>>` the length of the script and walked it byte by byte; without an
erasure to project through, that table holds `Some(original_offset + i)` at every `i`, so the
split loop can never break a run and the whole per-byte pass reduces to one span per matched
run. And `apply_transforms_to_expression_with_shadowed` rebuilt an identifier no transform had
rewritten as a *second* `Spanned` arena node holding the same span over a clone of the same
identifier; it now keeps the wrapper it arrived in.

What is left (+2.82 MB, +0.49%) is the `Spanned` node for identifiers a transform *does*
rewrite — the feature itself, not overhead around it.

**The benchmark suite cannot see any of this**: `benchmark_runner` hard-codes
`enable_sourcemap: false` (two sites), while `CompileOptions::default()` sets it **true**, so
CodSpeed measured a configuration in which the projection does not run and reported
"will not alter performance" for all 11 benchmarks. That is gate-coverage's population axis,
not its comparison axis: the numbers it printed were correct about the workload it ran.

**And the byte regression never converted into measurable time, which is the part worth
remembering.** Re-measured once the box was quiet (load ~10 on 10 cores): three release binaries
rotated through all 6 orders, 18 samples each, 3,637 real-world components as CSR with
`enable_sourcemap: true` — `main` 947.6 ms min / 957.7 ms mean, the branch before the fix
928.2 / 941.9, after it 925.9 / 938.3. The branch is ~2% *faster* than `main`, which is under the
~5% code-layout floor for separate-binary A/B, so the reading is parity in all three arms. The
0.4% the fix itself moved is not a claim. **An allocation-byte share is not a CPU share**: the
reason to fix it is that `JsStatement` and `JsExpr` are the types everything downstream is built
out of, not that a timer moved.
