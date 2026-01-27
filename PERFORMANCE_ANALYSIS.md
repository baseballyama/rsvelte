# Performance Analysis Report

## Executive Summary

Performance profiling of the Svelte Rust compiler reveals that **Client Transform** is the primary bottleneck, consuming 84% of compilation time for large files. Small-medium file performance improved 1.7-2.4x through regex caching. Further optimization requires architectural changes to the client transform phase.

## Baseline Measurements

### File Size Performance

| File | Parse | Analyze | Transform | Total |
|------|-------|---------|-----------|-------|
| small (75B) | 48µs | 18µs | 141µs | **206µs** |
| medium (1.7KB) | 135µs | 171µs | 801µs | **1.11ms** |
| large (38KB) | 2.0ms | 4.3ms | **32.7ms** | 40.5ms |

**Key Finding**: Transform phase dominates at 84% for large files.

### Client vs Server Transform

| Mode | synthetic-large (16KB) | Ratio |
|------|------------------------|-------|
| Client Transform | 12.5ms | 23x slower |
| Server Transform | 548µs | 1x baseline |

**Key Finding**: Client transform is 23x slower than server transform.

## Completed Optimizations

### 1. Regex Pattern Caching (Committed)

Cached frequently-compiled regex patterns using `LazyLock`:

| File | Before | After | Improvement |
|------|--------|-------|-------------|
| small (75B) | 498µs | 206µs | **2.4x** |
| medium (1.7KB) | 1.86ms | 1.11ms | **1.7x** |
| large (38KB) | 37.8ms | ~40ms | within variance |

Cached patterns:
- `src/compiler/phases/2_analyze/visitors/await_block.rs`: REGEX_THEN_BLOCK, REGEX_CATCH_BLOCK
- `src/compiler/phases/2_analyze/visitors/class_body.rs`: REGEX_INVALID_IDENTIFIER_CHARS
- `src/compiler/phases/3_transform/client/mod.rs`: REGEX_STATE_DERIVED_VAR
- `src/compiler/phases/3_transform/client/transform_template/template.rs`: REGEX_LEADING_NEWLINE
- `src/compiler/preprocess/replace_in_code.rs`: REGEX_LINE_TOKEN
- `src/compiler/phases/3_transform/js_ast/codegen.rs`: REGEX_COLLAPSE_ARRAYS
- `src/compiler/phases/1_parse/parser.rs`: REGEX_TYPESCRIPT_LANG

### 2. SIMD Text Scanning (Committed)

Added `memchr` crate for SIMD-accelerated text scanning in parser:
- `src/compiler/phases/1_parse/state/text.rs`: Uses `memchr2` to find '<' or '{' quickly

### 3. Vec/HashMap Pre-allocation (Committed)

Added capacity pre-allocation across the transform phase:

**transform_server.rs:**
- `output_parts: Vec::with_capacity(64)`
- `snippets: Vec::with_capacity(4)`
- Component attribute vectors

**fragment.rs (client):**
- `scopes: HashMap::with_capacity(4)`
- `hoisted: Vec::with_capacity(4)`
- `init: Vec::with_capacity(8)`
- `update: Vec::with_capacity(4)`
- `after_update: Vec::with_capacity(2)`
- `consts: Vec::with_capacity(4)`
- `let_directives: Vec::with_capacity(2)`
- `instance_level_snippets: Vec::with_capacity(2)`
- `module_level_snippets: Vec::with_capacity(2)`

**types.rs:**
- `path: Vec::with_capacity(16)` in ComponentContext

**mod.rs (client):**
- `component_body: Vec::with_capacity(32)`
- `body: Vec::with_capacity(16)`

**regular_element.rs:**
- Attribute categorization vectors pre-allocated based on attribute count
- `element_state_init: Vec::with_capacity(8)`
- `element_state_after_update: Vec::with_capacity(4)`

**element.rs (shared):**
- `quasis: Vec::with_capacity(4)`
- `expressions: Vec::with_capacity(4)`
- `current_text: String::with_capacity(64)`
- Property vectors sized based on directive count

### Current Performance (After Optimizations)

| File | Transform (Mean) | Total (Mean) |
|------|-----------------|--------------|
| small (75B) | ~165µs | ~210µs |
| medium (1.7KB) | ~840µs | ~1.1ms |
| large (38KB) | **~31ms** | ~37ms |

**Improvement from baseline:**
- Transform phase: 32.7ms → 31ms (~5% improvement)
- Overall: Consistent improvements across file sizes

## Identified Optimization Opportunities

### High Priority (Large Impact)

#### 1. Client Transform State Creation Overhead

**Location**: `src/compiler/phases/3_transform/client/visitors/fragment.rs:122-156`

Every fragment creates a new `ComponentClientTransformState` with:
- Multiple `HashMap::new()` and `Vec::new()` calls
- Several `.clone()` operations on options, transforms, metadata
- `Memoizer::with_parent_conflicts` allocation

**Potential Fix**: Use arena allocation or state pooling.

#### 2. Quadratic Sibling Matching Algorithm

**Location**: `src/compiler/phases/2_analyze/control_flow.rs:442-507`

Triple-nested loops cause O(n³) complexity:
```rust
for (other_idx, other_info) in &ctx.element_info {     // O(n)
    for (other_idx2, other_info2) in &ctx.element_info { // O(n)
        // ... more iteration
    }
}
```

For 1000-element templates, this creates billions of comparisons.

**Potential Fix**: Pre-sort by fragment_path/position, use binary search or indexed lookup.

#### 3. Excessive String Allocations

**Location**: Multiple files (474 `.to_string()` calls in transform phase)

Top offenders:
- `transform_server.rs`: 91 occurrences
- `server/visitors/shared/utils.rs`: 46 occurrences
- `expression_converter.rs`: 40 occurrences

**Potential Fix**: Use `Cow<str>`, `&str` references, or string interning.

### Medium Priority

#### 4. SIMD Text Scanning - DONE

Implemented using `memchr` crate. See "Completed Optimizations" section.

#### 5. Dynamic Regex Caching

**Locations** (dynamic patterns that cannot be easily cached):
- `src/compiler/phases/3_transform/client/mod.rs:962` (dynamic variable name pattern)

These patterns use runtime-generated strings so traditional static caching doesn't work.
Consider LRU cache for frequently-used patterns.

### Low Priority

#### 6. Struct Field Ordering

**Location**: `src/compiler/phases/2_analyze/types.rs`

`ComponentAnalysis` and `CssAnalysis` have suboptimal field ordering with bool fields scattered among larger types, causing padding waste.

**Potential Fix**: Reorder fields largest-first, use bitflags for multiple bools.

#### 7. Dynamic Pattern Regex

Dynamic regex patterns (e.g., variable name matching) cannot be cached traditionally. Consider:
- Regex caching with LRU cache for common patterns
- Using string matching instead of regex for simple patterns

## Recommended Implementation Order

1. **Regex caching** - ✅ DONE
2. **SIMD text scanning** - ✅ DONE
3. **Vec/HashMap pre-allocation** - ✅ DONE
4. **Quadratic algorithm fix** - Highest ROI for large templates (pending)
5. **Client state allocation** - Reduces per-fragment overhead (pending)
6. **String allocation reduction** - Gradual refactoring (pending)

## Benchmarking Commands

```bash
# Quick profiling with synthetic files
cargo run --release --bin profiler

# Profile specific file
cargo run --release --bin profiler -- --file path/to/component.svelte

# Profile directory
cargo run --release --bin profiler -- --dir svelte/packages/svelte/tests/runtime-runes/samples

# Criterion benchmarks
cargo bench --bench compiler

# JSON output for tracking
cargo run --release --bin profiler -- --output json > baseline.json
```

## Next Steps

1. **Quadratic algorithm fix** in control_flow.rs (estimated 10-100x improvement for large templates)
   - Pre-index elements by fragment_path using HashMap
   - Sort elements by position within each fragment
   - Use binary search or direct indexing for sibling lookup

2. **Client state cloning overhead** - Use Rc/Arc for shared immutable data in ComponentClientTransformState
   - `options`, `transform`, `events`, `state_fields`, `snippet_names` could be shared

3. **String allocation reduction** - Profile-guided optimization
   - Replace `.to_string()` with `Cow<str>` where possible
   - Consider string interning for repeated identifier names
