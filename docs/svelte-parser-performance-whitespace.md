# Svelte parser whitespace pass

The next [element pass](svelte-parser-performance-elements.md) measures further
improvements on ordinary real files.

This pass removes a repeated scan after boolean and shorthand attributes. Their
spans still end at the name; the parser keeps the following whitespace token
instead of discarding it and reading it again. Parsing and lookahead now share
one ASCII whitespace scan in `parse/whitespace.rs`. Error construction uses
`#[cold]` so it can stay outside hot code. The initial token estimate also has a
named byte-per-token constant.

Both arms use frozen common dependencies. Concurrent plugin registration changes
are preserved and are outside the measured parsing path. The base revision is
`d3fe0394b0b11ab70829fad9a544b2b03ac81618`; the dirty source snapshots and exact
hashes, not that revision alone, identify the measured code. See the
[measurement records](measurements/svelte-parser-whitespace/README.md).

Real inputs are the same 256 accepted files, 427,507 bytes, as the previous pass.
Each arm has 12 ABBA samples with 256 traversals per sample on an Apple M1 Pro.
The real input result is neutral: the cycle median falls only 0.03%, with broad,
overlapping ranges. This pass does not establish a general real-file speedup.

The synthetic set has eight generated files, 1,239,168 bytes. Each contains
64 boolean attributes and one valued attribute, separated by 512 to 4,096 spaces.
Each arm has eight ABBA samples with 64 traversals. The extra whitespace scan is
removed, so this input class has a clear benefit.

| Hardware count per batch, median | Before | After | Reduction |
|---|---:|---:|---:|
| Real cycles | 12,046,056 | 12,042,462 | 0.03% |
| Real instructions | 42,480,893 | 42,449,750 | 0.07% |
| Synthetic cycles | 4,149,713 | 2,226,226 | 46.35% |
| Synthetic instructions | 22,900,961 | 12,073,108 | 47.28% |

Counters include process startup, source loading, and one extra warmup, divided
by declared traversals. The host is shared, without CPU pinning. The trial without
`#[cold]` raised real instructions by about 0.30% and had neutral cycles. Its raw
results are retained. The final version keeps real instruction counts neutral.

The required three-arm comparison uses the same 256 files, 64 traversals and four
samples per arm. Median cycles per batch are 11,945,667 for the rewrite,
103,686,281 for old rsvelte, and 268,939,735 for official Svelte 5.57.1. All three
accept every input. Old rsvelte is revision
`5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`, uses fat LTO and no explicit warmup.
The rewrite uses thin LTO; the official tool uses normal JIT. They build different
AST shapes, so these are contextual parse API results, not equal output costs.

Allocation measurements use three traversals after warmup. Both arms have equal
counts. Real inputs with pooling on have 17,190 allocations, 1,031,310 allocated
bytes and 52,688 bytes of peak live growth. With pooling off they have 55,941
allocations, 21,857,577 allocated bytes and 300,592 bytes of peak live growth.
Synthetic inputs with pooling on have zero allocations and zero peak live growth;
with pooling off they have 384 allocations, 2,634,624 allocated bytes and 104,304
bytes of peak live growth. Peak live growth is above the heap level at the start
of tracking, not the total process heap. Parser state stays at 984 bytes and the
component payload at 928 bytes. RSS and actual hardware cache misses are
**UNMEASURED** in this pass.

Cachegrind uses four samples per arm, one warmup plus three traversals, with the
same 64-byte and assumed 128-byte models as the previous pass. Positive reductions
mean fewer events. The mixed results do not establish a general cache improvement.

| Simulated event | 64-byte model reduction | 128-byte model reduction |
|---|---:|---:|
| Data reads | 0.32% | 0.32% |
| Data writes | 0.32% | 0.32% |
| L1 instruction misses | 3.95% | -6.47% |
| L1 data read misses | 0.89% | -0.09% |
| L1 data write misses | -0.97% | -0.84% |

All 19,498 full tree/token/JavaScript or diagnostic hashes match: 19,410 accepted,
88 rejected, zero unreadable inputs and zero differences. All 11 production
parser tests pass, including whitespace around attributes, blocks, expressions,
comments and raw closing tags. A temporary defect that includes trailing
whitespace in boolean attribute spans makes the new test fail; restoring it
passes. Parser formatting and the structure check pass. Local Clippy passes with
`--no-deps` and only `clippy::multiple_crate_versions` disabled. Full Clippy stops
at two unrelated lints in `kernel/src/computation/plugins.rs`.
