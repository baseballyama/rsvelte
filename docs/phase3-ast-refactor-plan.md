# Phase 3 refactor: from string surgery to an AST → printer pipeline

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
