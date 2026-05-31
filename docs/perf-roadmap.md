# 100x Single-Threaded Speedup: Implementation Guide

## Current State (2026-05-18 update)

### Benchmark (3654 Svelte test files, baseline 2026-03-23)
```
Task               | JS       | Rust ST  | Speedup | Rust MT  | MT Speedup
Compile (Client)   |  ~700ms  |  ~310ms  |  2.3x   |  ~45ms   |  ~17x
Compile (SSR)      |  ~600ms  |  ~325ms  |  1.8x   |  ~45ms   |  ~14x
Parse              |  ~150ms  |  ~112ms  |  1.3x   |  ~15ms   |  ~10x
```

### Per-file Profile (7KB file, median, baseline 2026-03-23)
```
Phase      | Time     | % of Total
Parse      | 226 us   | 15%
Analyze    | 395 us   | 25%
Transform  | 917 us   | 60%
Total      | 1540 us  | 100%
```

### Target
- **100x single-threaded**: ~310ms / 100 = 3.1ms for 3654 files = 0.85 us/file
- **Baseline**: ~310ms / 3654 = 85 us/file
- **Gap**: ~100x improvement needed (most of the remaining gap is now in
  the text-transform pipeline — see Phase A below)

---

## Why It's Slow: Root Causes (updated 2026-05-18)

### 1. Text-based Transform Pipeline (still the #1 bottleneck)

~14K lines of character-by-character string scanning across:

```
expression_utils.rs   4530 lines  (utility scanners)
state_transforms.rs   3619 lines  ($.get / $.set / $.update)
rune_transforms.rs    1678 lines  ($state / $derived)
props_transforms.rs   3286 lines  (export let → $.prop)
formatting.rs         1709 lines  (normalize_js_with_oxc — OXC reparse + cleanup)
```

Plus the AST-based transformer that has begun replacing them:

```
ast_state_transform.rs 4044 lines (partial replacement — wired in for state vars)
```

`ast_state_transform::transform_state_vars_ast` already runs in the
client transform pipeline (see `mod.rs:4413`) and handles state-var
rewrites at the AST level. The text-transform passes still run alongside
it for everything else (runes, store, props, destructuring).

**Problem**: O(M*N) per text-transform pass where M=state vars, N=script
length. Multiple passes. The official Svelte compiler does the
equivalent in a single AST walk — that's the target.

### 2. JSON-based Analysis Walker (Phase 2)

`walk_js_node` in `script.rs` walks the script AST as
`serde_json::Value`, doing string-based type dispatch:

```rust
match node.get("type").and_then(|t| t.as_str()) {
    Some("VariableDeclarator") => variable_declarator::visit(node, context),
    ...
}
```

Phase 3 analysis dispatchers got a partial fast-path in 2026-05 (leaf
short-circuit for `has_call` / `has_member` / `has_await`), but the
core JSON-walking remains.

### 3. Parser Double Conversion (12.01% CPU)
Parser chain: OXC AST → `serde_json::Value` → `JsNode::from_value()`.
Most statement types still create `Value::Object(Map)` then convert.
Only a few types use direct JsNode.

### 4. Clone-heavy Phase 3 Transforms

~900 `.clone()` calls in `phases/3_transform/client/`. Many are
`CompactString::clone()` (cheap inline if ≤24 chars; alloc otherwise)
and `Vec<JsExpr>::clone()` (expensive). The 2026-05 `mem::replace`
sweep removed 7 hot save/restore clones in the directive loops.

### 5. ~~143 Box<T> Fields in AST Definitions~~ ✅ DONE

Replaced by `JsNodeId` / `ExprId` index-based arenas — see Phase B
status below. Only 1 stray `Box<JsExpr>` remains in a local helper
type (`shared/function.rs:105`) and isn't material.

---

## Architecture Changes Required (updated status)

### Phase A: Eliminate Text Transform Pipeline — 🟡 PARTIAL
**Impact: Highest. Transform is 60% of compile time.**
**Status: prototype integrated (`ast_state_transform.rs`); ~14K lines of text transforms remain.**

The official Svelte compiler does NOT do text-based transforms. It
walks the JS AST with visitors (VariableDeclaration,
AssignmentExpression, UpdateExpression, etc.) and applies transforms
at the AST level. Our code should do the same.

**Current flow (still partly text-based)**:
```
script text
  → ast_state_transform (AST pass for state vars)
  → text transforms (rune, store, props, destructure — char-by-char)
  → normalize_js_with_oxc (OXC reparse + formatting)
  → JsProgram AST → codegen
```

**Target flow (fully AST)**:
```
script text → OXC parse (1x) → AST walk with transforms → JsProgram AST → codegen
```

**Remaining work (multi-PR initiative)**:

Per text-transform file, port its responsibilities into the AST
visitor and delete the file:

1. `rune_transforms.rs` — `$state(x)` / `$derived(...)` / `$props()`
   call-expression rewrites. **Order this first**: smallest file, the
   most concentrated logic, and the AST visitor already has hooks
   (`visit_call_expression`).
2. `props_transforms.rs` — `export let foo` → `$.prop(...)` and the
   props destructuring rewrites. Heavily entangled with the existing
   AST `transform_props_destructuring`; finish that integration.
3. `state_transforms.rs` — the bulk of state mutations. The AST pass
   already handles reads; mutations (`x = y`, `x++`) need the same
   treatment.
4. `expression_utils.rs` — utility helpers used by the above; some
   become unnecessary once the callers are AST-based.
5. `formatting.rs` — `normalize_js_with_oxc` exists because text
   transforms produce dirty JS that needs a reparse-and-reprint pass.
   Once the AST pipeline produces clean output, this whole file can
   be deleted.

**Risk**: 3341 fixtures must continue to pass. Migrate one transform
case at a time, run the full compatibility report after each PR,
and keep the old text-transform path as a fallback until the AST
version has parity.

### Phase B: Index-based Arena — ✅ DONE
**Status: complete.**

`JsNode` uses `JsNodeId` (u32 index) + `ParseArena`. `JsExpr` uses
`ExprId` + `JsArena`. Phase 3 codegen visitors already thread the
arena through. Only 1 stray `Box<JsExpr>` remains in a local helper
type and isn't material.

### Phase C: Direct Buffer Codegen — 🔴 NOT STARTED
**Impact: Medium. Eliminates JsProgram intermediate AST.**

**Current flow**:
```
Transform visitors build JsExpr/JsStatement/JsProgram → codegen serializes to String
```

**Target flow**:
```
Transform visitors write directly to String buffer
```

Less urgent now that Phase B's arena makes the intermediate AST
cheap to construct. Worth measuring before committing — the win may
be smaller than initially estimated.

### Phase D: Remaining JSON + Cloning — 🟡 PARTIAL
**Status: targeted fixes landed; broader sweep pending Phase A.**

Recent progress (2026-05):
* `mem::replace` for the 7 hot save/restore clone sites in
  `types.rs` (PR #177)
* Leaf short-circuit for `expression_has_call` / `_has_member` /
  `_has_await` to skip `as_json()` serialization for trivial
  expressions (PR #178)
* `serde_json::Value` removed from the NAPI options input — typed
  `#[napi(object)] NapiCompileOptions` (PR #175)

The bulk of the JSON-dispatch work needs JsNode-based walkers
threaded with arena access — that's most naturally done as part of
Phase A.

### Phase E: Rust↔JS Boundary — ✅ DONE (May 2026)
**Status: complete. Built in the May 2026 PR series.**

Eliminated `serde_json` on the Rust↔JS boundary for the NAPI surface:

| Wave | PR | Win |
|---|---|---|
| Raw transfer (Buffer / envelope / bumpalo) | #168 | -10% boundary cost |
| `compileBatch` (rayon parallel) | #169 | **3.2x** for 16-file batches |
| `mapBytes` / `mapText` accessors | #174 | -5% on disk-emit |
| Typed `#[napi(object)]` options | #175 | input-side `serde_json` removed |
| `compileEnvelopeAsync` / `compileBatchAsync` (AsyncTask) | #176 | **4.3x** for 4 parallel compiles |

For dev-server fan-in (Vite's compile-many-files pattern) the boundary
is no longer the bottleneck — Rust compilation itself dominates again.

---

## Execution Order (updated 2026-05-18)

### Now: Phase A migrations
Pick one text-transform case per PR. Suggested order:
1. `$state(...)` call rewrite → AST visitor (port from
   `rune_transforms::process_state_call`)
2. `$derived(...)` call rewrite
3. State assignment (`x = y` where x is a state var) → AST
   `AssignmentExpression` visitor
4. State update (`x++`, `x--`) → AST `UpdateExpression` visitor
5. Props destructuring rewrites — finish the AST integration
6. Store auto-subscription (`$store`) → AST `IdentifierReference`
   visitor
7. Once 1-6 are done, delete the corresponding text-transform files
   and `normalize_js_with_oxc`.

Each PR must: (a) keep the legacy text-transform path running as a
fallback, (b) gate the AST path behind a flag if needed, (c) run
the full compatibility report (3341 fixtures) before merging.

### Later: Phase C direct codegen, finish Phase D JSON sweep
After Phase A is done, re-profile. The bottleneck distribution will
have shifted significantly and the next priorities will be clearer.

---

## Key Files (updated 2026-05-18)

| File | Lines | Role | Change Needed |
|------|-------|------|--------------|
| `3_transform/client/mod.rs` | ~5,300 | Transform orchestration | Switch passes to AST path |
| `3_transform/client/expression_utils.rs` | 4,530 | Char-by-char scanning | DELETE (Phase A) |
| `3_transform/client/state_transforms.rs` | 3,619 | $.get/.set/.update | DELETE (Phase A) |
| `3_transform/client/rune_transforms.rs` | 1,678 | $state/$derived | DELETE (Phase A) |
| `3_transform/client/props_transforms.rs` | 3,286 | Export let → $.prop | DELETE (Phase A) |
| `3_transform/client/formatting.rs` | 1,709 | OXC reparse | DELETE (Phase A) |
| `3_transform/client/ast_state_transform.rs` | 4,044 | AST visitor | EXPAND (Phase A) |
| `3_transform/client/visitors/*.rs` | 38,552+ | Template visitors | Keep |
| `3_transform/js_ast/nodes.rs` | ~870 | JsExpr/JsStatement | ✅ arena-ized |
| `3_transform/js_ast/codegen.rs` | ~2,000 | Serialize to JS | Phase C (later) |
| `ast/typed_expr.rs` | ~3,800 | JsNode enum | ✅ arena-ized |
| `1_parse/read/expression.rs` | ~9,000 | OXC→JSON→JsNode | Convert remaining types |
| `src/napi.rs` + `src/napi_raw.rs` | ~1,300 + ~700 | NAPI boundary | ✅ Phase E done |

## Verification

After each change:
```bash
# Unit tests
cargo test --release

# Compatibility report (must run after Phase A migrations especially)
pnpm run compatibility-report

# Runtime tests (MUST run in Docker)
docker exec rsvelte_core-dev cargo test --release --test runtime

# Benchmark
./scripts/bench/bench.sh --quick

# Profile
./scripts/bench/bench.sh --profile
cargo flamegraph --bin profiler -- --file submodules/svelte/packages/svelte/tests/runtime-runes/samples/form-default-value-spread/main.svelte --iterations 200 --warmup 20

# E2E Rust↔JS boundary check (after NAPI changes)
node --expose-gc scripts/dev/test-raw-transfer.mjs
```

## Critical Lessons

1. **flamegraph profiling is essential** — found the real bottlenecks
   (`replace_with_word_boundary_scoped` at 43.79%,
   `transform_state_assignments` at 66.88%)
2. **OXC codegen is fast** — thread-local allocator makes OXC parse +
   codegen only 0.7% of total time
3. **Adding a 2nd OXC parse HURTS** — AST transform integration
   increased compile time when it added a parse on top of text
   transforms. Must REPLACE, not ADD.
4. **JsNode::Raw fallback is critical** — ArrowFunctionExpression
   bodies store child nodes as `JsNode::Raw(Value)`. All pattern
   matching must handle Raw with JSON fallback.
5. **Test in Docker** — `docker exec rsvelte_core-dev cargo
   test --release --test runtime`
6. **Benchmark is noisy** — run 3 times, look at Rust absolute ms not
   the ratio (JS varies too)
7. **Small files dominate** — median test file is 154 bytes. Fixed
   per-file overhead matters more than per-byte efficiency.
8. **The boundary is no longer the bottleneck.** Phase E reduced the
   Rust↔JS crossing cost to near-zero for the realistic use cases.
   For further wins, focus on internal Rust optimization (Phase A
   most of all).
