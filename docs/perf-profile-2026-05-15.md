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

## Recommended priorities

In rough order of expected ROI (post-2026-05-15 measurement):

1. ~~Time-split `ensure_script_parsed` vs. visitors in Analyze.~~
   **Done** — see "Phase 2 sub-breakdown" above. OXC is ~12% of
   analyze; visitors dominate.
2. **Samply-profile the analyze visitors.** With visitors at
   ~42% of total compile time, this is now the biggest single
   lever. Use a long-running scenario or replay the full
   `compile_profile` workload to find the hot visitor function(s)
   before deciding what to migrate to AST traversal.
3. **bumpalo Phase 0–3** — already documented in
   `docs/bumpalo-migration-plan.md`. Expected +10–20% on transform.
4. **Template transform investigation** — needs its own profile;
   likely has hot spots untouched by the text→AST arc.
5. **Analyze visitor migration** — once §2 identifies the hot
   visitor(s), mirror the Phase 3 text→AST treatment for them.

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
