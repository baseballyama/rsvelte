# Svelte parser element pass

This pass removes work from ordinary element parsing. Component names are
classified once. Closing names reuse the length already checked by lookahead.
Optional closing rules read the next name only when the current element needs
that rule. Root `script` and `style` elements go directly to their parsers.
The optional closing rules still have one implementation.

Both arms freeze the same dependencies. Concurrent plugin registration changes
are preserved and are outside the measured direct parsing path. The base revision
is `d3fe0394b0b11ab70829fad9a544b2b03ac81618`; the dirty snapshots and exact
hashes identify the measured code. See the
[measurement records](measurements/svelte-parser-elements/README.md).

The population is the same 256 accepted real files, 427,507 source bytes, as the
previous passes. Each arm has 12 ABBA samples with 256 traversals per sample on
an Apple M1 Pro. Rust is 1.98.1 and Node is 26.7.0.

| Hardware count per batch, median | Before | After | Reduction |
|---|---:|---:|---:|
| CPU cycles | 11,677,169 | 11,255,473 | 3.61% |
| Instructions | 42,352,456 | 41,657,809 | 1.64% |

Counters include process startup, source loading and one extra warmup, divided
by declared traversals. The host is shared, without CPU pinning. Cycle ranges
overlap: 10,870,536–12,135,597 before and 10,430,549–12,029,811 after. These are
measured medians for this population, not a guarantee for every workload.

The three-arm comparison uses the same files, 64 traversals and four samples
per arm. Median cycles per batch are 12,200,154 for the rewrite, 113,330,887 for
old rsvelte and 270,511,135 for official Svelte 5.57.1. All arms accept all files.
Old rsvelte is revision `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`, with fat LTO
and no explicit warmup. The rewrite uses thin LTO; the official tool uses normal
JIT. Their AST shapes differ, so these are contextual parse API measurements.

Allocation measurements use three traversals after warmup. Both arms have equal
counts. With pooling on, they have 17,190 allocations, 1,031,310 allocated bytes
and 52,688 bytes of peak live growth. With pooling off, they have 55,941
allocations, 21,857,577 allocated bytes and 300,592 bytes of peak live growth.
Growth is measured above the heap level at the start of tracking, not the total
process heap. Parser state stays at 984 bytes and the component payload at 928
bytes. RSS and actual hardware cache misses are **UNMEASURED** in this pass.

Cachegrind uses four samples per arm, one warmup plus three traversals. The
64-byte model has 32 KiB, eight-way L1 caches and an 8 MiB, sixteen-way last-level
cache. The assumed 128-byte model has a 192 KiB, three-way instruction cache,
128 KiB, eight-way data cache and 12 MiB, twelve-way last-level cache. These are
models, not hardware measurements. Positive reductions mean fewer events.

| Simulated event | 64-byte model reduction | 128-byte model reduction |
|---|---:|---:|
| Instructions | 1.66% | 1.66% |
| Data reads | 1.19% | 1.19% |
| Data writes | 0.86% | 0.86% |
| L1 instruction misses | -3.52% | 10.24% |
| L1 data read misses | -1.97% | -0.75% |
| L1 data write misses | 0.20% | -0.47% |

The mixed miss results do not establish a general cache improvement.

All 19,498 full tree/token/JavaScript or diagnostic hashes match: 19,410 accepted,
88 rejected, zero unreadable inputs and zero differences. All 13 production
parser tests pass. New tests cover optional closing rules, nested elements,
Unicode and dotted component names, void elements, root scripts/styles and
mismatched closing diagnostics. Disabling the `li` optional closing rule makes
the new test fail; restoring it passes. Formatting, the structure check and
Clippy with all targets, all features and warnings denied pass.
