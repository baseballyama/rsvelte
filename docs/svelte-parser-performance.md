# Svelte parser

This report records the first pass. Later changes are measured in the
[follow-up report](svelte-parser-performance-followup.md).

The parser now separates fragment reading, HTML rules, attribute values, directives,
embedded JavaScript, patterns, and snippets. Shared state stays in `parse.rs`, which
fell from 549 to 210 lines. `Parser`, `component`, and `pending_children` replace the
short state names. [Module map](../crates/languages/svelte/parser/README.md).

Text, quoted attribute values, and textarea delimiters use `memchr` searches.
The measured ARM build uses its NEON implementation. Unquoted values and names
use byte predicates at ASCII delimiters. Expressions still end where the JavaScript
parser ends. Static closing tags and borrowed debug identifiers remove temporary
allocations. The parser no longer stores a second slice of the source bytes.

The base commit is `d3fe0394b0b11ab70829fad9a544b2b03ac81618`. Measurements use
frozen dirty snapshots, with the same dependency sources in both rewrite arms.
[Metadata](measurements/svelte-parser/metadata.json) records source, input, tool,
and executable hashes. [Sources](measurements/svelte-parser/sources.tar.gz)
include the measurement runners and layout probes. The candidate also contains a computation wrapper added by concurrent work.
The runner calls the parser directly; it does not call artifact registration.

| Population | Files | Source bytes | Declared rounds per CPU sample |
|---|---:|---:|---:|
| Selected corpus | 256 | 427,507 | 256 |
| Long text and quoted values, synthetic | 32 | 390,016 | 512 |

The selection orders accepted paths by their SHA-256 hash and takes the first 256.
Official Svelte 5.57.1 and old rsvelte accept all selected inputs. This checks
acceptance, not equivalence between their different AST formats.

Hardware counters on an Apple M1 Pro give these observed medians. Each batch
contains every file in its population. Main samples use ABBA order, twelve samples
per arm; synthetic samples use eight per arm. Process counts include startup,
source loading, and one warmup traversal, then divide by the declared rounds.
The shared host is not pinned to a core. Background builds occurred, and the main
cycle ranges overlap. These numbers do not establish a globally fastest parser.

| CPU metric per batch | Before | After | Reduction |
|---|---:|---:|---:|
| Selected corpus cycles | 12,899,046 | 12,430,147 | 3.64% |
| Selected corpus instructions | 44,496,638 | 42,706,285 | 4.02% |
| Synthetic cycles | 1,934,572 | 906,076 | 53.16% |
| Synthetic instructions | 10,160,925 | 4,825,411 | 52.51% |

A separate three-arm run uses 64 rounds and four samples per arm in forward/reverse
order. Old rsvelte is revision `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`.
Rewrite release uses thin LTO; old release uses fat LTO. Official uses normal V8 JIT.
The old arm has no separate warmup. Each parser builds its own AST representation;
these are whole parse-call costs, not equal-output microbenchmarks.

| Parser | Observed CPU cycles per 256-file batch |
|---|---:|
| Rewrite after | 12,332,144 |
| Old rsvelte | 99,290,453 |
| Official Svelte | 246,822,267 |

Allocation builds are separate from CPU builds. These totals cover three traversals
of the selected corpus after warmup. Peak live growth is measured above the heap
level where tracking starts; it is not the process's total heap.

| Memory metric | Before | After |
|---|---:|---:|
| Allocations, pooling on | 18,924 | 17,190 |
| Allocated bytes, pooling on | 1,041,768 | 1,031,310 |
| Peak live growth, pooling on | 52,688 | 52,688 |
| Allocations, pooling off | 56,925 | 55,191 |
| Allocated bytes, pooling off | 21,740,631 | 21,730,173 |
| Peak live growth, pooling off | 303,064 | 303,064 |
| Parser state, bytes | 1,000 | 984 |
| Component payload, bytes | 928 | 928 |

Two RSS samples per arm in ABBA order range from 3,981,312 to 4,030,464 bytes before
and 3,817,472 to 3,915,776 after. This small sample does not establish a stable RSS
reduction. The measured heap peaks stay unchanged.

Cachegrind runs one warmup plus three declared traversals, with four samples per arm
and model. Positive reductions below mean fewer events; negative values mean more.
The 128-byte model uses assumed associativities. Neither model reproduces the full
M1 microarchitecture. Lower instruction and data-access counts coexist with some
higher miss counts; this change does not improve every cache metric.

| Simulated event | 64-byte model reduction | 128-byte model reduction |
|---|---:|---:|
| Instructions | 3.57% | 3.57% |
| Data reads | 2.09% | 2.09% |
| Data writes | 1.67% | 1.67% |
| L1 instruction misses | 2.84% | -25.34% |
| L1 data read misses | 0.10% | -0.18% |
| L1 data write misses | -1.31% | -1.11% |

Hardware cache misses are **UNMEASURED**. A real Linux `perf` probe with
`CAP_PERFMON` reports all six PMU events as unsupported. macOS provides the CPU
counters above but no cache misses through this collector.

All 19,498 corpus inputs have identical before/after hashes of the complete tree,
tokens, embedded JavaScript, or diagnostic: 19,410 accepted, 88 rejected, zero
unreadable. [Parity records](measurements/svelte-parser/parity.json) retain the
population and digest files. Changing the quoted-value expression delimiter in a
temporary copy makes two boundary tests fail; restoring it makes all six pass.

Parser tests, the corpus lossless test, compile/format/semantic tests, parser Clippy
with both feature sets, and parser formatting pass. Workspace tests stop at an
unrelated type cast in `svelte/lint/src/lint/execute.rs`. The structure check stops
at the unrelated 607-line `compile_vapor/src/compilation/script/emit.rs`. Whole
workspace Clippy and formatting also fail in unrelated files; their raw logs are
retained. Parser
source files are at most 337 lines. Raw results and reproduction notes are in the
[measurement directory](measurements/svelte-parser/README.md).
