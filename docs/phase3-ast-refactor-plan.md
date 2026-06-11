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
