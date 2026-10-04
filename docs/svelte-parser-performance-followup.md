# Svelte parser follow-up

The next pass is measured in the [whitespace report](svelte-parser-performance-whitespace.md).

This pass compares the previous optimized parser with three further changes:

- Move token recording into `parse/token.rs`. Copy comment-free JavaScript tokens
  directly; use the shared merge iterator when comments exist. Both paths use one
  implementation to record whitespace and tokens.
- Use `memchr` for the script language pre-scan and `memmem` for raw script/style
  closing tags. ASCII matches remain UTF-8 boundaries.
- Limit the initial token reservation to 8,192 tokens. Dense inputs still grow.
  A trial limit of 1,024 caused more reallocations and was rejected.

Both measured arms include component-reference parsing added by concurrent work.
Common dependencies are frozen. The dirty source snapshots, source hashes,
compiler versions, and executable hashes are in the
[measurement records](measurements/svelte-parser-followup/README.md). The base
revision is `d3fe0394b0b11ab70829fad9a544b2b03ac81618`; it alone does not identify
the measured code.

The hardware is an Apple M1 Pro. Real inputs are the same 256 accepted files,
427,507 bytes, used in the first pass. Each arm has 12 ABBA samples with 256
traversals per sample. The synthetic set has eight generated files, 11,440,208
bytes, with long Unicode attributes, text, and style comments; each arm has eight
ABBA samples with 64 traversals. Counts include process startup, source loading,
and one extra warmup, divided by declared traversals. This is a shared host
without CPU pinning. Ranges overlap for real inputs.

| Hardware count per batch, median | Before | After | Reduction |
|---|---:|---:|---:|
| Real input cycles | 12,042,989 | 11,670,477 | 3.09% |
| Real input instructions | 43,518,582 | 42,279,363 | 2.85% |
| Synthetic input cycles | 20,731,502 | 6,764,452 | 67.37% |
| Synthetic input instructions | 124,717,915 | 31,950,785 | 74.38% |

The required three-arm comparison uses the same 256 real inputs, 64 traversals,
and four samples per arm. Median cycles per batch are 12,497,947 for this rewrite,
104,362,422 for old rsvelte, and 268,942,697 for official Svelte 5.57.1. Old rsvelte
is revision `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`. All three accept every
input. They build different AST shapes; old rsvelte uses fat LTO, the rewrite thin
LTO, and the official compiler normal JIT. These are contextual parse API results,
not a comparison of equal output representations. The old runner has no explicit
warmup. Raw samples are retained.

Allocation measurements use three traversals after warmup. Peak live growth is
above the heap level at the start of tracking, not the whole process heap.

| Memory count | Before | After |
|---|---:|---:|
| Real allocations, pooling on | 17,190 | 17,190 |
| Real allocated bytes, pooling on | 1,031,310 | 1,031,310 |
| Real peak live growth, pooling on | 52,688 | 52,688 |
| Real allocations, pooling off | 55,941 | 55,941 |
| Real allocated bytes, pooling off | 21,864,993 | 21,857,577 |
| Real peak live growth, pooling off | 303,064 | 300,592 |
| Synthetic allocated bytes, pooling off | 102,972,816 | 2,370,240 |
| Synthetic peak live growth, pooling off | 7,020,432 | 98,848 |

Synthetic allocated bytes fall 97.70%; peak live growth falls 98.59%. With pooling
on, synthetic allocations stay at 12, allocated bytes at 384, and peak live growth
at 32. Parser state stays at 984 bytes and the component payload at 928 bytes.
RSS and actual hardware cache misses are **UNMEASURED** in this pass.

Cachegrind uses four samples per arm, one warmup plus three traversals, under the
same 64-byte and assumed 128-byte models as the first pass. Positive reductions
mean fewer events. Instruction and data access counts fall, but some miss counts
rise. These results do not establish a general cache-miss improvement.

| Simulated event | 64-byte model reduction | 128-byte model reduction |
|---|---:|---:|
| Instructions | 2.83% | 2.83% |
| Data reads | 0.85% | 0.85% |
| Data writes | 0.06% | 0.06% |
| L1 instruction misses | -2.69% | -5.64% |
| L1 data read misses | 0.15% | -0.03% |
| L1 data write misses | -1.20% | -0.45% |

All 19,498 corpus results have identical full tree/token/JavaScript or diagnostic
hashes: 19,410 accepted, 88 rejected, zero differences and zero unreadable files.
The nine parser tests pass, including comment-free, comment-only, mixed, and
large sparse/dense inputs. A temporary defect that drops comments makes the new
test fail; restoring it passes. Parser formatting passes. Local Clippy passes
with `--no-deps` and only `clippy::multiple_crate_versions` disabled. Full Clippy
stops at unrelated syntax lint errors and duplicate `syn` versions. The structure
check stops at the unrelated 631-line `compile_vapor` template block file; parser
source files are at most 337 lines.
