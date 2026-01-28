# Performance Report - Svelte Compiler Rust

## Date: 2026-01-28

## Summary

This report compares the performance of the Rust Svelte compiler against the official JavaScript Svelte compiler.

## Test Environment

- **Machine**: macOS Darwin 24.5.0
- **Rust Version**: 1.90+ (Edition 2024)
- **Node.js Version**: Latest LTS
- **Svelte Version**: 5.x (from submodule)

## Optimizations Applied

1. **FxHash**: Replaced all std HashMap/HashSet with FxHashMap/FxHashSet (5-10x faster lookups)
2. **jemalloc**: Global allocator for better multi-threaded performance
3. **SmallVec**: Avoid heap allocation for small collections (Binding.references, mutations)
4. **memchr**: SIMD-accelerated string searches in parser and CSS
5. **Bit-packing**: ExpressionMetadata flags packed into single u8
6. **Release Profile**: LTO=fat, opt-level=3, strip=symbols

## Benchmark Results

### Phase Breakdown (Rust Compiler)

| File Size | Parse | Analyze | Transform | Total |
|-----------|-------|---------|-----------|-------|
| Small (75B) | 11µs | 23µs | 229µs | 263µs |
| Medium (1.7KB) | 90µs | 157µs | 861µs | 1.1ms |
| Large (38KB) | 1.4ms | 3.5ms | 21.8ms | 26.7ms |

### Throughput by Phase (MB/s)

| Phase | Small | Medium | Large |
|-------|-------|--------|-------|
| Parse | 6.7 | 19.2 | 27.8 |
| Analyze | 3.3 | 11.1 | 10.8 |
| Transform | 0.3 | 2.0 | 1.8 |

### Comparison: Rust vs JavaScript

| Test Case | JS (ms) | Rust (ms) | Speedup |
|-----------|---------|-----------|---------|
| Small client | 0.104 | 0.033 | **3.1x** |
| Small server | 0.108 | 0.034 | **3.2x** |
| Large client | 13.2 | 11.6 | **1.1x** |
| Large server | 8.9 | 2.7 | **3.3x** |

## Analysis

### Current Performance vs Goal

- **Goal**: 100x faster than JavaScript
- **Current**: 1.1x - 3.3x faster (depending on file size and mode)
- **Achievement**: ~3% of goal

### Bottleneck Analysis

The Transform phase (Phase 3) accounts for ~80% of total compilation time:

```
Parse:     ~5% of total time  (fastest, highly optimized)
Analyze:   ~15% of total time (good performance)
Transform: ~80% of total time (bottleneck)
```

### Why Transform is Slow

1. **Incomplete Implementation**: Many visitors are placeholder stubs or partially implemented
2. **String Building**: Heavy use of string concatenation for code generation
3. **Complex AST Traversal**: Deep recursive visitor patterns
4. **Missing Optimizations**: No memoization, repeated computations

### Server vs Client

Server-side compilation is 3-4x faster than client-side because:
- Client transform generates reactive code with complex runtime calls
- Server generates simpler static HTML with minimal reactivity

## Recommendations for 100x Goal

### High Impact (Estimated 10-30x improvement)

1. **Complete Phase 3 Implementation**
   - Many visitors are incomplete/placeholder
   - Full implementation may actually be faster than partial

2. **String Interning**
   - Cache common strings (identifiers, operators)
   - Use `compact_str` more aggressively

3. **Arena Allocation for Transform**
   - Use bumpalo for temporary allocations during transform
   - Reduce heap churn

### Medium Impact (Estimated 3-10x improvement)

4. **Parallel Transform**
   - Transform independent subtrees in parallel
   - Use rayon for template fragment processing

5. **Code Generation Optimization**
   - Use rope data structure for string building
   - Pre-allocate output buffers based on input size

6. **AST Node Pooling**
   - Reuse allocated AST nodes
   - Implement object pool for common node types

### Lower Impact (Estimated 1-3x improvement)

7. **SIMD for Code Generation**
   - Use SIMD for escape sequences
   - Vectorized whitespace handling

8. **Profile-Guided Optimization**
   - Build with PGO for production

## Conclusion

The current implementation achieves **3x average speedup** over JavaScript. The primary bottleneck is the Transform phase, which is both the most complex and least optimized.

To reach the 100x goal:
1. Complete the Phase 3 implementation (currently ~12% test pass rate)
2. Apply arena allocation to transform phase
3. Implement parallel subtree transformation
4. Optimize string/code generation

The fundamental architecture (memory layout, FxHash, jemalloc) is solid. The performance gap is primarily due to incomplete implementation rather than architectural issues.

## Appendix: Benchmark Commands

```bash
# Run parser benchmark
cargo bench --bench parser

# Run compiler benchmark
cargo bench --bench compiler

# Run profiler
cargo run --release --bin profiler -- --iterations 20 --warmup 5

# Compare with JavaScript
node scripts/benchmark-comparison.mjs
```
