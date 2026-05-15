# Perf profile snapshot — 2026-05-15

Captured immediately after the 18-PR text→AST migration arc landed
(PRs #92–#110). Used to identify the next perf direction.

## Method

```bash
cargo build --release --bin compile_profile
./target/release/compile_profile
```

`compile_profile` runs `parse` + `analyze` + `transform` over every
`input.svelte` under `submodules/svelte/packages/svelte/tests/runtime-runes/samples`
and `runtime-legacy/samples` — **3,637 files, 850 KB total** —
warming up with 100 full compiles first, then measuring each phase
in isolation across all files.

## Results

```
Files: 3637, Total: 849936 bytes

  Parse+resolve:       11.95ms
=== Compile Phase Breakdown ===
Phase 1 (Parse):       11.59ms (  2.5%)
  Resolve lazy:         0.00ms (  0.0%)
Phase 2 (Analyze):    226.50ms ( 49.5%)
Phase 3 (Transform):  219.80ms ( 48.0%)
TOTAL:                457.90ms

Per-file average:    125.90µs
Throughput:          1.9 MB/s
```

## Reading the numbers

### Phase 1 — Parse (2.5%)

The Svelte template parser (`src/compiler/phases/1_parse/`) is no
longer the bottleneck. Past optimization work (recent commits show
"perf(svelte2tsx): cut single-thread runtime ~45%" — same tree)
has already taken parse below the noise floor. Don't touch parse
without strong evidence it regressed.

`defer_script_parse: true` is on by default in this binary, so the
JS parse cost is moved into Phase 2 below.

### Phase 2 — Analyze (49.5%)

This is what `analyze_component` does, including:

1. `resolve_lazy::resolve_lazy_expressions` — finish the deferred
   JS expression parses from Phase 1.
2. `ensure_script_parsed(ast.instance)` and `ensure_script_parsed(ast.module)`
   — invoke OXC to produce the full JS AST. **This is OXC's work,
   not ours.**
3. Visitor passes:
   - `template_element` visitor (scope tracking through template tags)
   - `call_expression` visitor
   - Binding analysis / scope resolution
   - …

A back-of-envelope guess at the split: **JS parsing via OXC is
~30–40% of analyze**, the rest is our visitors.

→ **Measured 2026-05-15** (see §"Phase 2 sub-breakdown" below): the
30–40% guess was wrong by ~3×. OXC is only **~12% of analyze**;
visitors are **~86%**.

**Measured perf headroom in Analyze**:

| Sub-step | Measured cost | Headroom |
|---|---|---|
| `ensure_script_parsed` (OXC) | ~12% of analyze (5.8% of total) | Limited — already small, and OXC is upstream-tuned. |
| Visitors (our code) | ~86% of analyze (42% of total) | Real and large — these are not yet AST-migrated like the transform-side handlers. |
| `resolve_lazy_expressions` | ~3% of analyze (1.3% of total) | Negligible. |
| Symbol-table / scope build | (within "Visitors") | Real — `FxHashMap` lookups in tight loops. |

### Phase 3 — Transform (48.0%)

After 18 AST migration PRs, transform is still nearly half the
compile time. Sub-phases:

- `transform_client` / `transform_server` — script transform
  (rune handling, state-var wrapping, …)
- Template transform (HTML → JS conversion)
- Codegen (OXC formatting + sourcemap)

The text→AST migrations have eliminated most per-statement byte
scans, but the remaining cost is:

- The AST walk itself (oxc visitor traversal)
- String allocations in replacement building
- OXC codegen for the final output
- Template-to-JS transformation (separate from script transform)

**Likely next targets in Transform**:

1. **Template transform** — not yet AST-migrated; uses different
   architecture. Search for hot spots there.
2. **Codegen** — `String::push_str` patterns; check
   `String::with_capacity` is used.
3. **bumpalo** (`docs/bumpalo-migration-plan.md`) — eliminates the
   `JsNodeId` indirection in the Svelte template AST. Phase 3 of
   the plan is where the +10–20% comes from.

## Phase 2 sub-breakdown — measured 2026-05-15

Added by patching `src/bin/compile_profile.rs` to pre-run
`resolve_lazy_expressions` and `ensure_script_parsed` with their own
timers. Both are idempotent (early-return when there is no deferred
work left), so the subsequent `analyze_component` call skips those
steps internally and reports visitor-only time.

Steady-state (mean of 3 consecutive runs after a cold-start warm-up):

```
Phase 1 (Parse):         11.6ms (  2.5%)
Phase 2 (Analyze):      225.9ms ( 49.4%)
  Resolve lazy:           5.8ms (  1.3% of total,   2.6% of analyze)
  Ensure script (OXC):   26.6ms (  5.8% of total,  11.8% of analyze)
  Visitors (rest):      193.5ms ( 42.4% of total,  85.6% of analyze)
Phase 3 (Transform):    219.6ms ( 48.1%)
TOTAL:                  457.1ms
```

(The very first run after `cargo build` is a ~20% slower cold start —
file-cache miss on 3,637 inputs. Discard it for steady-state numbers.)

### Conclusion

The doc's prior "30–40% OXC" guess is wrong: **OXC parse is only
~12% of analyze**, and the conditional in the original
"Recommended next investigation" §1 ("if >40%, focus on OXC") does
not fire. We do **not** need to audit `defer_script_parse` or look
for a doubled parse.

The lever is **our visitors**: 193ms / 42% of total compile time
sits in `analyze_component` after the OXC work finishes. None of
the analyze visitors have been AST-migrated yet (the 18-PR text→AST
arc covered Phase 3 only).

## Phase 2 visitor sub-breakdown — measured 2026-05-15

Drilling one level deeper into the "Visitors (rest)" slice. Measured
by temporarily adding an `analyze-perf-trace` cargo feature with
atomic-counter instrumentation around every major sub-step inside
`analyze_component`. (The feature was reverted after the
measurement — it was throwaway; reproducing requires re-adding it.)

Steady-state (mean of 3 consecutive runs after warm-up):

```
--- analyze-perf-trace (sub-step breakdown, sorted by time) ---
  script_visit (instance)            69.3ms ( 35.6%)
  feature_detect (await/runes)       54.6ms ( 28.1%)
  analyze_template                   20.8ms ( 10.7%)
  create_scopes                      15.7ms (  8.1%)
  build_siblings                      8.2ms (  4.2%)
  css_analyze                         7.6ms (  3.9%)
  name_deconflict                     6.9ms (  3.5%)
  detect_store_subs                   3.3ms (  1.7%)
  extract_scripts                     2.4ms (  1.2%)
  script_visit (module)               2.1ms (  1.1%)
  promote_legacy_state                0.9ms (  0.5%)
  process_legacy_exports              0.7ms (  0.4%)
  mark_each_group                     0.5ms (  0.3%)
  reactive_cycles                     0.4ms (  0.2%)
  populate_legacy_deps                0.3ms (  0.2%)
  unused_export_check                 0.3ms (  0.1%)
  synth_class_style_attrs             0.2ms (  0.1%)
  runes_warnings                      <0.1ms
  module_export_check                 <0.1ms
  (sum of buckets)                  ~195ms
```

The sum of buckets covers **~98.6%** of the "Visitors (rest)" slice
(200.3ms in the same run). The remaining ~3ms lives in small
between-step glue (the `is_module_file` detection, `maybe_runes`
computation, `slot_snippet_conflict` check, `module_scope_declarations`
snapshot, etc.) — collectively negligible.

### Reading the result

**Two sub-steps account for ~64% of all visitor time and ~26% of
total compile time:**

1. **`script_visit (instance)` — 69.3ms, 14.8% of total.**
   `visitors::visit_script_expr` on the instance script. This is
   the main AST walk that dispatches to all the per-node analyze
   visitors (`call_expression`, `assignment_expression`,
   `identifier`, `function_declaration`, …). It is the single
   biggest function in the compiler.

2. **`feature_detect (await/runes)` — 54.6ms, 11.7% of total.**
   `fragment_check_features` (cheap, walks typed template) plus
   `json_check_features` called twice (instance + module JSON
   walks). The two JSON walks are the costly half — and the source
   already has `TODO: migrate json_check_features to JsNode walker`
   markers in `2_analyze/mod.rs`. The data confirms those TODOs.

The next tier (`analyze_template`, `create_scopes`) is meaningful
but ~3× smaller per item, and `create_scopes` is data-structure
heavy (less migratable than JSON walks). Everything below
`build_siblings` is in the noise.

### Updated next-PR target

Replace the previous "Samply-profile the analyze visitors" item
with the concrete output:

1. **Migrate `json_check_features` to a typed JsNode walker.**
   - Bucket #2 (`feature_detect`) — currently ~55ms / 11.7% of total.
   - Two callsites: `analyze_component` lines ~239-266 (instance +
     module JSON walks). Both have explicit TODOs.
   - Mirrors the playbook used for the Phase 3 text→AST migration:
     replace `inst.content.as_json()` walks with `JsNode`
     pattern-matching.
   - Expected savings: cut the JSON-walk half of `feature_detect`
     (estimate 25–40ms), roughly **5–8% of total compile time** for
     a single PR.
   - **Done in #112.** Achieved -5.3% on the visitor slice / -1.0%
     of total compile time (smaller than the projection — likely
     because `Expression::as_json()` is cached, so the conversion
     just shifts to `MODULE_EXPORT_CHECK_NS` which still calls
     `as_json()` on the module script).

2. **AST-migrate the analyze visitors run from
   `visit_script_expr`.** Bucket #1 (~69ms). Bigger surface than #2
   — the visitor dispatch fans out to many per-node handlers — so
   this is best attacked one visitor at a time. The text→AST PR arc
   (#92–#110) is the template.

3. **bumpalo Phase 0–3** — unchanged.

4. **Template transform investigation** — unchanged.

## `walk_js_node_typed` per-variant breakdown — measured 2026-05-15

Drilling one more level into `script_visit (instance)`. Measured by
temporarily wrapping each match arm in `walk_js_node_typed` (and the
post-visit `visit_children_typed` call, plus the `Raw(Value)`
fallback) with an `analyze-perf-trace` atomic counter, then running
the 3,637-file `compile_profile` workload. Same throw-away pattern
as the earlier sub-breakdown — feature reverted after capture.

Steady-state (mean of 3 consecutive runs after warm-up):

```
--- walk_js_node_typed per-variant breakdown (sorted by time) ---
  visit_children_typed (post-visit walk)       58.2ms ( 33.7%)
  VariableDeclarator                           28.9ms ( 16.8%)
  walk_js_node (Raw fallback)                  16.5ms (  9.6%)
  ExportNamedDeclaration                       15.9ms (  9.2%)
  FunctionDeclaration                          14.5ms (  8.4%)
  CallExpression                               13.4ms (  7.8%)
  ExpressionStatement                          10.8ms (  6.3%)
  AssignmentExpression                          5.8ms (  3.4%)
  FunctionExpression+Arrow                      5.3ms (  3.1%)
  Identifier                                    0.9ms (  0.5%)
  UpdateExpression                              0.7ms (  0.4%)
  MemberExpression                              0.5ms (  0.3%)
  LabeledStatement                              0.4ms (  0.2%)
  NewExpression                                 0.4ms (  0.2%)
  Literal                                       0.2ms (  0.1%)
  (other, no visitor)                           0.1ms (  0.1%)
  TemplateElement                               0.1ms
  ImportDeclaration                             <0.1ms
  AwaitExpression                               <0.1ms
  ClassDeclaration/Body/Property/Export-default <0.1ms
  (sum)                                       ~172ms
```

Buckets are *inclusive* of recursive descent into child nodes, but
the sum (~172ms) covers ~90% of "Visitors (rest)" (~190ms), so the
attribution is meaningful even with that overlap.

### Reading the result

- **`visit_children_typed` (33.7%)** is the post-visit recursive
  descent dispatcher itself — arena lookups + match-arm overhead
  spread across millions of small node visits. There's no single
  visitor to migrate here; speedups would need structural changes
  (e.g. reducing match-arm overhead, or eliminating recursion at
  some level).

- **`VariableDeclarator` (16.8%, ~29ms / ~6% of total)** is the
  largest single per-visitor bucket. The `visit_typed` body has
  five `to_value().to_string()` callsites used to set
  `binding.initial` for diagnostics and constant folding. *But*:
  `binding.initial` is consumed by 20+ downstream sites across
  `phase3_transform/` and `phase2_analyze/`, several of which
  explicitly parse the JSON representation (e.g. "Check for
  TemplateLiteral JSON format (from binding.initial)" in
  `client/visitors/shared/utils.rs`). Migrating to source-span
  strings would break the JSON-shape contract — a real PR, not a
  one-liner.

- **`walk_js_node (Raw fallback)` (9.6%, ~16ms)** is statements
  parsed as `JsNode::Raw(Value)` because they carry
  `leadingComments` that aren't modelled in typed `JsNode`
  variants. Fixing this requires a parse-phase change (model
  comments separately so statements stay typed), not a visitor
  migration.

- **`ExportNamedDeclaration` (9.2%, ~16ms)** has one `to_value()`
  callsite (`export_named_declaration.rs:572`) that materialises
  the entire declaration into a `Value` and then introspects it via
  `.get("type")`, `.get("declarations")`, etc. Migration would
  replace the JSON introspection with `JsNode` pattern matching —
  cleaner scope than VariableDeclarator (only one function uses the
  materialised Value), but the function body is ~140 lines of JSON
  walking.

- **`FunctionDeclaration` (8.4%, ~14ms)** — `visit_typed` is
  already minimal and typed; most of its bucket time is recursive
  descent into the function body. No actionable migration here.

### Next-PR candidates

In decreasing ROI:

1. **`ExportNamedDeclaration` to typed pattern matching.** Single
   function, one to_value() callsite, no downstream contract
   change. Expected ~10–15ms cut.

2. **`VariableDeclarator.binding.initial` source-span migration.**
   Larger PR — touches ~20 downstream consumers — but ~29ms is on
   the table.

3. **Raw fallback elimination.** Parse-phase: model leadingComments
   off-tree so statements stay typed. ~16ms but cross-phase change.

4. **`visit_children_typed` dispatch hot path.** Structural — no
   obvious low-effort win.

## Recommended priorities

In rough order of expected ROI (post-2026-05-15 measurements):

1. ~~Time-split `ensure_script_parsed` vs. visitors in Analyze.~~
   **Done** — see "Phase 2 sub-breakdown" above. OXC is ~12% of
   analyze; visitors dominate.
2. ~~Samply-profile the analyze visitors.~~ **Done** via
   `analyze-perf-trace` instrumentation — see "Phase 2 visitor
   sub-breakdown" below. Two buckets dominate: `script_visit
   (instance)` (35.6%) and `feature_detect` (28.1%).
3. **Migrate `json_check_features` to a typed JsNode walker.**
   Concrete next-PR target — see "Updated next-PR target" below.
   Expected savings: ~5–8% of total compile time.
4. **AST-migrate analyze visitors run from `visit_script_expr`.**
   Bucket #1 (~14.8% of total compile time). One visitor at a time,
   mirroring the Phase 3 text→AST arc (#92–#110).
5. **bumpalo Phase 0–3** — already documented in
   `docs/bumpalo-migration-plan.md`. Expected +10–20% on transform.
6. **Template transform investigation** — needs its own profile;
   likely has hot spots untouched by the text→AST arc.

## Anti-priorities

Skip these unless profiling proves otherwise:

- **Parse phase** — 2.5% of total, already well-optimized.
- **Non-dev `$inspect` migration** — cold code (dev-only feature),
  see `docs/text-to-ast-remaining-handover.md` §1.
- **Class-field `$.tag` wrap** — dev-mode only, likely cold.

## How to reproduce

```bash
git checkout main
cargo build --release --bin compile_profile
./target/release/compile_profile
```

For a single-file deeper sample:

```bash
./target/release/profiler \
  --file submodules/svelte/packages/svelte/tests/runtime-runes/samples/form-default-value-spread/main.svelte \
  --iterations 20 --warmup 5
```

For function-level breakdown (samply, view in Firefox Profiler):

```bash
RUSTFLAGS="-C force-frame-pointers=yes" cargo build --release --bin compile_profile
samply record ./target/release/compile_profile
```
