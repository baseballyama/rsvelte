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
~30–40% of analyze**, the rest is our visitors. To get a real number,
add timing splits around each `ensure_script_parsed` call and around
the visitor invocations.

**Plausible perf headroom in Analyze**:

| Sub-step | Likely cost | Headroom |
|---|---|---|
| `ensure_script_parsed` (OXC) | ~30–40% of analyze | Limited — OXC is already tuned; switching parsers isn't realistic. |
| Visitors (our code) | ~60% of analyze | Real — these are not yet AST-migrated like the transform-side handlers. |
| `resolve_lazy_expressions` | small | Small — already memoized |
| Symbol-table / scope build | medium | Real — `FxHashMap` lookups in tight loops |

**Recommended next investigation** (analyze phase):

1. Time `ensure_script_parsed` separately from the visitors. If it's
   >40% of analyze, **don't touch the visitors** — focus on reducing
   OXC parse cost (e.g., is `defer_script_parse` actually deferring,
   or is something forcing the parse twice?).
2. If visitors dominate, profile with `samply` against a single
   long-running scenario to find the hot visitor function.

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

## Recommended priorities

In rough order of expected ROI:

1. **Time-split `ensure_script_parsed` vs. visitors in Analyze.**
   This is a 1-hour task that tells you which 25% of total compile
   time is OXC vs. our code. Cheap information; do this first.
2. **bumpalo Phase 0–3** — already documented in
   `docs/bumpalo-migration-plan.md`. Expected +10–20% on transform.
3. **Template transform investigation** — needs its own profile;
   likely has hot spots untouched by the text→AST arc.
4. **Analyze visitor migration** — only if Step 1 shows visitors
   dominate analyze.

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
