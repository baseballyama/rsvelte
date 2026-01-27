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

### 2. Vec Pre-allocation (Minor Impact)

Added capacity pre-allocation to transform_server.rs:
- `output_parts: Vec::with_capacity(64)`
- `snippets: Vec::with_capacity(4)`
- Component attribute vectors

Impact: Minimal measurable improvement (already efficient).

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

#### 4. SIMD Text Scanning

**Location**: `src/compiler/phases/1_parse/`

Parser scans text character-by-character:
```rust
while self.index < self.source.len() && !self.match_str("<") && !self.match_str("{") {
    self.advance();
}
```

**Potential Fix**: Use `memchr` crate for SIMD-accelerated character search.

#### 5. More Regex Caching

**Locations** (still using `Regex::new()` inline):
- `src/compiler/phases/1_parse/parser.rs:181`
- `src/compiler/phases/3_transform/js_ast/codegen.rs:154` (dynamic pattern)
- `src/compiler/phases/3_transform/client/mod.rs:949` (dynamic pattern)

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

1. **Regex caching** - DONE
2. **Quadratic algorithm fix** - Highest ROI for large templates
3. **Client state allocation** - Reduces per-fragment overhead
4. **SIMD text scanning** - Improves parse phase
5. **String allocation reduction** - Gradual refactoring

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

1. Fix quadratic algorithm in control_flow.rs (estimated 10-100x improvement for large templates)
2. Profile Client Transform to identify specific bottlenecks
3. Implement state pooling/arena allocation for fragment processing
4. Add memchr for SIMD text scanning in parser
