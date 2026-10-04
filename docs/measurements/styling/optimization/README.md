# Further styling optimization

Measured on 2026-10-02: Apple M1 Pro, macOS 26.6.2, Rust 1.98.1,
Node 26.7.0, Svelte 5.57.1. All performance rows use the same 18 inputs.
[Metadata](metadata.json) identifies both binaries, all source files, and inputs.
The base commit is `a25573c64087dd1f417321f19139b3edd709bf03`.
The before source is [the previous archive](../sources.zip); the after source is
[this archive](sources.zip). Both contain uncommitted changes.

The shared workspace continued to change. The fixed snapshots isolate this change
from other work. They exclude concurrent whitespace/minification work; the same
optimizations are also applied in the workspace.

## Changes

- Build DOM topology, nesting-rule indices, and attribute values only on demand.
  Cache each fact for the file.
- Share one attribute matcher. Keep checking after a known class fails to match,
  so a later spread can still match. Attribute presence needs no value evaluation.
- Keep immutable CSS lists in boxed slices. Store the first simple selector inside
  its compound; only additional selectors need a buffer.
- Start parser buffers with one slot, then grow geometrically.
- Use one buffer for the scope modifier, repeated modifier, and keyframe prefix.
- Use static callbacks for matching. Linear sibling flows need no traversal buffers.
- Execute a one-thread pipeline on the calling thread. Both execution modes call
  the same per-document implementation. Parallel runs still use the worker pool.

No custom allocator or unsafe code was added to the compiler.

## Before and after

CPU counters use `proc_pid_rusage(RUSAGE_INFO_V4)` between stdin gates.
Inputs are loaded before 20 warmup rounds. Six trials per arm each run 4,000 rounds,
in before/after/after/before order, repeated three times. Startup, input loading,
warmup, and final JSON printing are outside the interval. Controls run zero rounds.
[Raw snapshots](ab.json) and [results](results.json) preserve the population and spread.

| Metric per 18 inputs | Before | After | Reduction |
|---|---:|---:|---:|
| Median native CPU cycles | 1,190,572 | 936,834 | 21.3% |
| Median native retired instructions | 4,378,387 | 4,086,144 | 6.7% |
| Linux simulated instructions | 3,859,631 | 3,588,245 | 7.0% |
| Allocations | 4,295 | 3,956 | 7.9% |
| Allocated bytes | 383,129 | 313,106 | 18.3% |
| Peak live allocation growth, bytes | 59,869 | 43,101 | 28.0% |
| CSS emission allocations | 186 | 96 | 48.4% |
| Analysis allocations | 310 | 237 | 23.5% |

Native cycle ranges are 1,062,971–1,358,539 before and 915,740–973,395 after.
Zero-round controls measured 29,465 and 30,727 cycles; they are not subtracted.
Every measured round emits 15,314 bytes. Linux counts subtract one-round from
two-round Cachegrind runs, with cache and branch simulation disabled.
Allocation counters use the metrics CLI in one-thread mode, over 18 documents.
Peak growth is the largest per-file live increase, not process RSS.

## Three compilers

The [three-arm comparison](three-arm.json) uses four trials per compiler, 1,000
rounds each, in official/old/rewrite/rewrite/old/official order, repeated twice.

| Compiler | Median cycles per 18 inputs | Range |
|---|---:|---:|
| Official Svelte | 20,386,564 | 19,204,219–21,039,527 |
| Old rsvelte | 9,204,886 | 9,022,195–9,676,731 |
| Optimized rewrite | 981,927 | 951,655–1,045,078 |

The old commit is `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`.
Official compilation builds source maps; native measurements exclude them.
Old release uses fat LTO and abort; the rewrite uses thin LTO and unwind.
These differences prevent a claim about an equal-work speed ratio.

## Memory maps and layout

`vmmap` inspected each process at the first gate after warmup. These are two samples,
not medians: [before](before-vmmap-summary.txt), [after](after-vmmap-summary.txt).
Full address maps are saved beside the summaries.

| Map value | Before | After |
|---|---:|---:|
| Physical footprint, KiB | 2,736 | 2,512 |
| Malloc zone virtual size, MiB | 32.8 | 16.8 |
| Malloc zone live allocated bytes, KiB | 130 | 116 |
| Stack virtual size, MiB | 10 | 8 |

Virtual space includes uncommitted pages. The allocator still retains free pages;
its map values must not be read as the size of the compiler's live trees.

[Inline layout](layout.tsv): Rule 104 → 80 bytes; ComplexSelector 48 → 40 bytes.
RelativeSelector is now 88 bytes and contains its first 48-byte Simple selector.
Previously its 48-byte header pointed to a separate buffer. A one-item compound
now needs no separate allocation. The fixed snapshot's StyleSheet is 216 bytes;
the workspace's additional whitespace field makes it 232 bytes.

## Validation and limits

- CSS: 1,637 exact matches, 524 unparsed, zero mismatches out of 2,161 units,
  in both the snapshot and current workspace.
- Client/server: all 36 JS ASTs and CSS outputs match for the 18 measured inputs.
- Deliberately corrupting a copied CSS oracle makes the comparison fail;
  restoring it makes the comparison pass.
- Kernel: 58 tests and the task contract pass. CSS parser tests and all nine
  styling tests pass. The 53 hand-written compile cases keep all 116 snapshots.
- Four generated spread cases now match the oracle. Regression tests also cover
  empty class arrays and uppercase attribute names.
- Strict Kernel/CSS/semantic Clippy, workspace format, and structure pass.
  Workspace tests fail in the unrelated CLI render-plan test; workspace Clippy
  fails in unrelated compile name/identity code. Logs and exit codes are saved here.

[Raw profiles and measurement drivers](raw.zip) retain the evidence. Reproduce
the after build and three-arm counters with the commands in the
[previous report](../README.md#reproduce), using this source archive.
CPU affinity and frequency were not fixed. Other architectures, whole-corpus
compilation speed, and Vite/HMR remain **UNMEASURED**. This is a measured improvement,
not proof of a global optimum or complete coverage of unparsed inputs.
