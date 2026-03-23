---
name: perf
description: Performance optimization skill for reaching 100x single-threaded speedup over the JS Svelte compiler. Use when working on performance improvements, benchmarking, or profiling the rsvelte compiler.
argument-hint: "[phase: parse|client|ssr|all]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, WebSearch, WebFetch
effort: max
---

# Performance Optimization — Target: 100x Single-Threaded

## Goal

Achieve **100x single-threaded speedup** over the official Svelte JS compiler in all three areas:

| Area | Current | Target | Gap |
|------|---------|--------|-----|
| **Parse** | ~1.3x | 100x | ~77x to go |
| **Compile (Client)** | ~1.2x | 100x | ~83x to go |
| **Compile (SSR)** | ~1.6x | 100x | ~63x to go |

## Design Principle: Simplify, Don't Complicate

**高速なプログラムはシンプルなデータ構造に対してシンプルなコードが書かれている。**

パフォーマンス改善のためにコードを修正する際、複雑性を上塗りするアプローチは避けること。
複雑なコードにさらに複雑な最適化を重ねても限界がある。代わりに、根本のデータ構造やアルゴリズムをシンプルにすることで高速化を目指す。

**やるべきこと:**
- データ構造を簡素化する（不要な間接参照・抽象化を取り除く）
- コードパスを短くする（不要な中間表現・変換ステップを削除する）
- 問題の根本原因を特定し、構造そのものを見直す
- 「このコードは本当に必要か？削除できないか？」をまず考える

**やってはいけないこと:**
- 既存の複雑なコードの上にキャッシュやワークアラウンドを追加する
- 複雑性を維持したまま micro-optimization で補おうとする
- 読みにくいコードを書いて数%の改善を得る（構造改善の方が桁違いに効く）

**判断基準:** 最適化後のコードが最適化前より読みにくくなっているなら、アプローチを見直すべき。
真の高速化はコードをシンプルにした結果として得られることが多い。

## Step 0: Measure Current Performance

**ALWAYS measure before and after every change.** Run:

```bash
./scripts/bench.sh --quick    # Single-threaded comparison table
./scripts/bench.sh --profile  # Per-phase breakdown (parse/analyze/transform)
```

Record the baseline numbers before starting any optimization work.

## Step 1: Profile and Identify Bottlenecks

Before optimizing, understand WHERE time is spent:

```bash
# Per-phase profiler (parse, analyze, transform breakdown)
./scripts/bench.sh --profile

# Criterion micro-benchmarks (statistical, per-phase)
./scripts/bench.sh --criterion

# System-level profiling (macOS Instruments / perf)
cargo build --release --bin profiler
instruments -t "Time Profiler" ./target/release/profiler -- --file path/to/large.svelte --iterations 100
# Or on Linux:
# perf record --call-graph dwarf ./target/release/profiler -- --file path/to/large.svelte --iterations 100
# perf report
```

Focus on the **top 5 hottest functions** before deciding what to optimize.

## Step 2: Optimization Roadmap

The following optimizations are ordered by expected impact. Apply them in order,
measuring after each change.

### Phase A: Eliminate serde_json::Value (Expected: 5-20x improvement)

**This is the single biggest bottleneck.** The current code stores JS expressions as
`serde_json::Value`, requiring:
- Heap allocation for every object/array/string
- Repeated serialization/deserialization
- No type safety, runtime field lookups

**What OXC does:** OXC uses a fully typed AST with arena allocation. Every AST node
is a concrete Rust struct/enum — no dynamic JSON.

**Action items:**
1. Read `src/ast/js.rs` and `src/ast/typed_expr.rs` — the `TypedExpr` path already exists
2. Audit all code paths that still create `Expression::Value(serde_json::Value)`
3. Convert them to use `Expression::Typed(TypedExpr)` with proper `JsNode` variants
4. Remove `serde_json::Value` from the hot path entirely
5. The `JsNode` enum in `typed_expr.rs` has 100+ variants — ensure all needed variants exist

```bash
# Find remaining serde_json::Value usage in expressions
rg "Expression::Value" src/ --type rust
rg "serde_json::Value" src/ --type rust -l
rg "json!\(" src/ --type rust -l
```

### Phase B: Arena Allocation with Bumpalo (Expected: 2-5x improvement)

**Current state:** AST nodes are individually heap-allocated with `Box<T>` and `Vec<T>`.
Each allocation goes through the global allocator.

**What OXC does:** OXC allocates ALL AST nodes from a single bump allocator (`bumpalo`).
This means:
- Allocation is just bumping a pointer (nearly free)
- Deallocation is freeing the entire arena at once (one operation)
- Better cache locality (nodes are contiguous in memory)

**Note:** `bumpalo` is already in Cargo.toml but NOT used in the codebase.

**Action items:**
1. Study OXC's `oxc_allocator` crate: how `Box<'a, T>` and `Vec<'a, T>` work with lifetimes
2. Add a lifetime parameter to the AST: `Root<'a>`, `Fragment<'a>`, `TemplateNode<'a>`, etc.
3. Replace `Box<T>` → `bumpalo::boxed::Box<'a, T>` for AST nodes
4. Replace `Vec<T>` → `bumpalo::collections::Vec<'a, T>` for child node lists
5. Thread the allocator through the parser: `Parser<'a> { alloc: &'a Bump }`
6. This is a large refactor — do it incrementally, starting with the parser phase

```rust
// Before:
struct Element {
    name: String,
    children: Vec<TemplateNode>,
    attributes: Vec<Attribute>,
}

// After (OXC style):
struct Element<'a> {
    name: &'a str,           // Borrowed from source or arena
    children: Vec<'a, TemplateNode<'a>>,
    attributes: Vec<'a, Attribute<'a>>,
}
```

### Phase C: String Interning / Atoms (Expected: 1.5-3x improvement)

**Current state:** Strings are stored as `CompactString` — good for short strings but
still allocates for longer ones. Duplicate strings are stored multiple times.

**What OXC does:** OXC uses `Atom<'a>` — strings borrowed from the source text or
interned in the arena. Common strings (tag names, attribute names, `"div"`, `"class"`)
are compared by pointer, not by content.

**Action items:**
1. Study `oxc_span::Atom` and how it works with the arena
2. For identifiers and tag names that come directly from source code, store `&'a str`
   references into the original source string instead of copying
3. For generated strings (code generation), allocate from the arena
4. Consider a simple string interner for frequently used strings

```rust
// Before:
name: CompactString,  // Allocates and copies

// After:
name: Atom<'a>,       // Points into source or arena
```

### Phase D: Code Generation Optimization (Expected: 2-5x improvement)

**Current state:** Code generation builds an intermediate `JsNode` tree, then serializes
it to a string. This intermediate representation is expensive.

**What OXC does:** OXC's codegen writes directly to a buffer using a `Codegen` struct
that maintains indentation state. No intermediate tree — AST → string directly.

**Action items:**
1. Study `oxc_codegen` — see how it walks the AST and writes to a buffer
2. For the transform phase, consider writing output JS directly to a `String` buffer
   instead of building a `JsNode` tree first
3. Use `std::fmt::Write` or a pre-allocated `String` with estimated capacity
4. Avoid string concatenation in hot loops — use `write!()` macro

```rust
// Before (current): AST → JsNode tree → serialize to String
// After (target):   AST → write directly to String buffer

struct CodeWriter {
    buf: String,
    indent: u32,
}

impl CodeWriter {
    fn write_expression(&mut self, expr: &Expression) {
        // Directly write to self.buf without intermediate nodes
    }
}
```

### Phase E: Reduce Cloning (Expected: 1.5-3x improvement)

**Current state:** Many functions clone AST nodes. The `JsNode` enum is large and
cloning it is expensive.

**Action items:**
1. Find all `.clone()` calls on AST types:
   ```bash
   rg "\.clone\(\)" src/compiler/phases/3_transform/ --type rust | wc -l
   ```
2. Replace clones with references (`&T`) or `Rc<T>` / `Arc<T>` where shared ownership is needed
3. Use `Cow<'a, T>` for values that are usually borrowed but occasionally modified
4. For the visitor pattern, pass `&mut` references instead of owned values

### Phase F: Parser Optimization (Expected: 2-4x improvement)

**Current state:** The parser uses OXC for JS parsing but handles Svelte template
parsing in custom Rust code.

**Action items:**
1. Profile the parser specifically:
   ```bash
   ./scripts/bench.sh --profile  # Look at parse phase time
   ```
2. Minimize UTF-8 validation — the source is already validated once
3. Use byte-level operations (`&[u8]`) instead of `&str` methods where possible
4. Avoid regex where simple state machines suffice (OXC never uses regex for parsing)
5. Pre-compute lookup tables for character classification
6. Minimize the number of `String` allocations during parsing — borrow from source

### Phase G: Miscellaneous Micro-Optimizations

These individually small gains compound:

1. **Use `#[inline]` on hot functions** — especially small methods called in tight loops
2. **Prefer `FxHashMap`** over `HashMap` (already partially done)
3. **Use `SmallVec`** for collections that are usually small (already partially done)
4. **Avoid `format!()`** in hot paths — use pre-allocated buffers
5. **Bit-packed flags** instead of multiple `bool` fields
6. **Cache-friendly traversal** — process nodes in memory order
7. **`likely`/`unlikely`** hints for branch prediction (nightly only, or use `#[cold]`)

## Step 3: Validate

After each optimization:

1. **Run benchmarks:** `./scripts/bench.sh --quick`
2. **Run tests:** `cargo test --release` (never break correctness for speed)
3. **Run full vitest:** Verify NAPI binding still works
   ```bash
   cargo build --release --features napi --lib
   cp target/release/libsvelte_compiler_rust.dylib svelte/rsvelte.darwin-arm64.node
   cd svelte && USE_RSVELTE=true npx vitest run packages/svelte/tests/runtime-runes/test.ts packages/svelte/tests/runtime-legacy/test.ts
   ```
4. **Update README.md** performance tables with new numbers

## Step 4: Update README.md

After confirming improved benchmark results, update the Performance section in README.md.

The performance tables in README.md look like this:

```markdown
## Performance

Benchmark of N Svelte files (average of 3 runs):

**Compile (Client)**

| | Time | Throughput | Speedup |
|---|---:|---:|---:|
| **JavaScript (svelte/compiler)** | Xms | Y files/sec | 1.0x |
| **Rust (single-threaded)** | Xms | Y files/sec | **Z.Zx** |
| **Rust (multi-threaded)** | Xms | Y files/sec | **Z.Zx** |
```

Update all three tables (Client, SSR, Parse) and the highlights line:
```markdown
- **Z.Zx faster single-threaded, Z.Zx faster multi-threaded**
```

## OXC Architecture Reference

When implementing optimizations, study these OXC crates:

| Crate | Purpose | Key Technique |
|-------|---------|---------------|
| `oxc_allocator` | Arena allocation | `Bump` allocator, `Box<'a, T>`, `Vec<'a, T>` |
| `oxc_ast` | Typed AST | Concrete structs, no dynamic types |
| `oxc_parser` | JS/TS parser | Zero-copy, byte-level ops, lookup tables |
| `oxc_codegen` | Code generation | Direct buffer writing, no intermediate repr |
| `oxc_span` | Source positions | `Atom<'a>` for string interning, `Span` for positions |
| `oxc_syntax` | Syntax utilities | Operator tables, keyword lookup |

### How to study OXC source code

```bash
# OXC source is available as Cargo dependencies
# Find the local cached source:
ls ~/.cargo/registry/src/*/oxc_allocator-*/src/
ls ~/.cargo/registry/src/*/oxc_parser-*/src/
ls ~/.cargo/registry/src/*/oxc_codegen-*/src/
ls ~/.cargo/registry/src/*/oxc_ast-*/src/

# Or browse online: https://github.com/nickel-org/nickel.rs... actually:
# https://github.com/nickel-org → wrong. Use:
# The OXC repo: search for oxc on GitHub (oxc-project/oxc)
```

### Key OXC patterns to learn

1. **Arena-allocated AST traversal**
   - OXC passes `&'a Allocator` to the parser
   - All nodes allocated via `allocator.alloc(node)` → returns `Box<'a, T>`
   - Dealloc is a no-op — the arena is freed all at once

2. **Visitor pattern**
   - OXC uses `Visit` and `VisitMut` traits
   - Visitors receive references, not owned values
   - No cloning during traversal

3. **Codegen buffering**
   - `Codegen` struct has a `Vec<u8>` buffer
   - `print_str()`, `print_char()`, `print_space()` methods
   - Indentation tracked as a counter, not a string

## Quick Reference Commands

```bash
# Measure performance
./scripts/bench.sh              # Full comparison (JS vs Rust, single + multi)
./scripts/bench.sh --quick      # Quick single-threaded table
./scripts/bench.sh --profile    # Per-phase breakdown
./scripts/bench.sh --criterion  # Statistical micro-benchmarks

# Find optimization targets
rg "serde_json::Value" src/ --type rust -l          # JSON value usage
rg "\.clone\(\)" src/compiler/ --type rust -c        # Clone frequency
rg "format!\(" src/compiler/ --type rust -c           # format! in hot paths
rg "String::from\|\.to_string\(\)" src/ --type rust -c  # String allocations
rg "Box::new" src/ --type rust -c                     # Heap allocations

# Build and test
cargo build --release
cargo test --release
cargo bench

# NAPI build and test
cargo build --release --features napi --lib
cp target/release/libsvelte_compiler_rust.dylib svelte/rsvelte.darwin-arm64.node
```

## Workflow

When the user invokes `/perf $ARGUMENTS`:

1. If `$ARGUMENTS` specifies a phase (parse, client, ssr), focus on that phase
2. If `$ARGUMENTS` is empty or "all", work on the highest-impact bottleneck
3. **Always start by measuring** current performance with `./scripts/bench.sh --quick`
4. **Profile** to find the top bottleneck: `./scripts/bench.sh --profile`
5. Apply ONE optimization at a time
6. **Measure again** and compare
7. **Run tests** to verify correctness: `cargo test --release`
8. **Update README.md** with new performance numbers
9. **Commit** the changes with a descriptive message
