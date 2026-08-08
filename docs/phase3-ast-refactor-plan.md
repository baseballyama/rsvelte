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

## Findings (2026-08-08 — the `to_value` cost is one site, and it is not the lazy cache)

**`JsNode` → `serde_json::Value` is an OPEN target, and the part of it worth
attacking is `instance_labeled_statements_json` in `2_analyze/mod.rs` — not the
lazy JSON cache that #2510 / #2570 / #2576 optimized.**

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
open-webui, and exactly zero on runes-only code (SMUI). It is therefore also
invisible to the CodSpeed benchmark population, which is 8/9 runes.

**No time share is claimed here, by either instrument.** A wall-clock timer over
all 54 sites spanned 5.07 / 2.89 / 0.58% of compile across three runs on
identical deterministic work (loaded machine); an allocator-model estimate was
retracted by its author for a circular correction factor. Both are recorded as
unresolved. Do not quote a percentage for this site without a new measurement.
A related probe — vendoring `serde_json` to swap `IndexMap`'s SipHash for FxHash
— measured huly −4.08% (8/8 paired wins), which sizes the *hashing* component but
sits at the ~5% code-layout floor for a separate-binary A/B and was not shipped.

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

