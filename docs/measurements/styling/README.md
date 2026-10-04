# Scoped-style validation and performance

See [the further optimization report](optimization/README.md) for the later CPU,
allocation, layout, and memory-map measurements. This report keeps the earlier results.

Measured on 2026-10-02. Oracle: Svelte 5.57.1, Node 26.7.0.
Native measurements use Apple M1 Pro, arm64 macOS 26.6.2, Rust 1.98.1.
Instruction counts use aarch64 Linux in Docker and Valgrind 3.22.0.

The base commit is `a25573c64087dd1f417321f19139b3edd709bf03`.
The old compiler commit is `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`.
The rewrite was measured from an uncommitted, fixed source snapshot. The shared
workspace continued to change. Commit labels alone do not identify these results:
[metadata](metadata.json) records every source hash and the binary hashes;
[sources.zip](sources.zip) preserves the measured rewrite source and lockfile.

## Correctness

| Population | Result |
|---|---|
| External corpus with CSS oracles | 2,161 inputs; 1,637 exact CSS matches; 524 parse failures; no parsed CSS differences |
| Common performance population | 18 inputs; both client and server JS ASTs and CSS match: 36 of 36 output pairs |
| Additional attribute probes | 46 inputs; 46 exact CSS matches |
| Handwritten compiler fixtures | 53 cases; 116 unchanged snapshots; no problems |
| Styling regressions | 8 tests, including branches, recursion, directives, globals, keyframes, and escape handling |

[Corpus rows](corpus.tsv) name every unparsed input. These inputs are not passes.
The [latest shared-workspace run](corpus-current.tsv) has the same counts.
The [JS comparison](compile-ast.json) uses the repository's canonical AST,
including pure annotations. CSS is compared as text. No oracle snapshots were
edited. An injected CSS difference made `--check` fail; restoring the output
made it pass ([positive control](positive-control.json)). Two upstream bug
exceptions are documented in [the implementation notes](../../styling.md).
The [additional probe archive](attribute-probes.zip) keeps its inputs and oracle CSS.

## Allocation and instruction measurements

The population contains 18 official CSS samples, 8,382 source bytes.
All 18 compile cleanly. Each client round emits 15,314 bytes. Input paths and
content hashes are in metadata. Counts are for one warm round over all inputs.

| Measurement | Before local optimizations | After |
|---|---:|---:|
| CSS emission allocations | 360 | 186 |
| CSS emission allocated bytes | 29,242 | 22,803 |
| Svelte analysis allocations | 484 | 310 |
| Svelte analysis allocated bytes | 24,366 | 20,278 |
| Complete client allocations | 4,645 | 4,295 |
| Complete client allocated bytes | 393,768 | 383,129 |
| Peak live allocation growth | 59,869 | 59,869 |
| Complete client instructions | 3,938,854 | 3,859,631 |

The changes remove scratch collections from ordinary ancestor traversal and
replace allocated insertion strings with borrowed edits. CSS emission allocations
fell by 48.3%; analysis allocations fell by 36.0%. Complete compilation instructions
fell by 2.0%. These are local before/after results, not a comparison with the old
compiler's allocation counts.

[Before](allocations-before.json) and [after](allocations.json) contain phase counts.
The shipped Linux binary has metrics disabled. Its warm instruction count is
`rounds=2` minus `rounds=1`: 8,372,333 minus 4,512,702
([first log](instructions-round1.log), [second log](instructions-round2.log)).

CPU cycles are measured separately below. The earlier Linux-only probe failed;
macOS exposes usable process counters without administrator access.
Official and old-compiler allocation counts remain **UNMEASURED**.

## CPU cycles

The same 18 inputs were measured with macOS `proc_pid_rusage(RUSAGE_INFO_V4)`.
The driver reads `ri_cycles` and `ri_instructions`; these are OS counters,
not elapsed time multiplied by an assumed clock rate. Apple's
[kernel implementation](https://github.com/apple-oss-distributions/xnu/blob/main/osfmk/kern/bsd_kern.c)
fills these fields from task power information.

Each child preloads its inputs and compiles 20 warmup rounds. It then waits on
stdin while the parent reads the first counter values. After 1,000 client rounds,
the child waits again while the parent reads the final values. Startup, loading,
warmup, final JSON printing, and the parent's work are outside the interval.
The interval includes compilation, output checks, and the small gate overhead.
Counters cover the child process's threads, including any background JS work.

Each compiler has four measured trials, in the same forward/reverse order as
the timing comparison. The table gives cycles per round over all 18 inputs.
[Raw counter snapshots and summaries](cycles/results.json) record every trial,
binary hash, driver hash, input hash, and output byte count.

| Compiler | Median cycles per 18 inputs | Range | Median cycles per input |
|---|---:|---:|---:|
| Official Svelte | 19,508,237 | 18,981,006–20,666,455 | 1,083,791 |
| Old rsvelte | 9,597,106 | 9,177,218–9,869,756 | 533,173 |
| Rewrite snapshot | 1,386,467 | 1,129,271–1,710,559 | 77,026 |

Zero-round controls measured 124,973, 28,105, and 20,181 cycles respectively.
The 1,000-round trials exceeded each control and emitted consistent output
sizes. The table does not subtract the controls. The source-map and build-profile
differences described below also apply here. CPU affinity and frequency were
not fixed; retain the range, especially for the rewrite.

A separate [process-total check](cycles/process-total-check.zip) uses
`/usr/bin/time -l` and paired 1,000-round minus zero-round runs. Its cycle counts
also increased with compilation. The original timing logs already contained
cycle counters; the earlier claim that all CPU cycles were unmeasured was wrong.
[Timing rows](timings.json) now retain those process-lifetime counters too.
The direct interval measurements above are the primary result.

## Three-arm timing

Each process preloads the 18 inputs, warms up for 20 rounds, then compiles 200
client rounds. The order was official, old, rewrite, rewrite, old, official,
repeated twice. Values below are medians of four runs. [Raw runs](timings.json)
retain the spread.

| Compiler | ms per 18 inputs | Range, ms | Peak process RSS, MiB |
|---|---:|---:|---:|
| Official Svelte | 4.7514 | 4.6625–5.1442 | 193.54 |
| Old rsvelte | 2.6883 | 2.6478–2.9207 | 8.60 |
| Rewrite snapshot | 0.3400 | 0.3144–0.4346 | 4.12 |

This measures complete compilation on a small population, including JS output.
It does not measure CSS alone or establish a corpus-wide speed ratio. Official
compilation still builds source maps; native timing excludes maps. Old release
uses fat LTO and abort; the rewrite uses thin LTO and unwind. The rewrite uses
the serial pipeline; old and official call their compiler APIs directly. RSS
includes the runtime, input storage, warmup, and compiler. Other work on the
machine can affect elapsed time.

## Layout

Sizes are bytes, with alignment 8 except `Declaration` (alignment 4).
[The layout probe](layout.tsv) measures the archived source on arm64.

| Type | Bytes |
|---|---:|
| StyleSheet | 224 |
| Rule | 104 |
| Declaration | 32 |
| ComplexSelector | 48 |
| RelativeSelector | 48 |
| Simple selector | 48 |
| Owned edit record | 32 |
| Borrowed edit record | 24 |

The DOM link, flow node, and relation edge are 12, 16, and 8 bytes; compile-time
assertions protect those sizes. Relation heads and indices use typed 32-bit IDs.
The table describes inline records, not their separately allocated buffers.
Concurrent whitespace/minification work changes the current tree layout; it is
outside this measured snapshot.

## Reproduce

Copy the inputs listed in metadata into `<population>/<filename>/input.svelte`.
Use the archived source when reproducing these exact results.

```sh
cargo +1.98.1 build --release -p rsvelte_command_line --bin rsvelte --features metrics
target/release/rsvelte performance <population> --task svelte.compile/client rounds=2
cargo +1.98.1 run --release -p rsvelte_svelte_compile --example styling_bench -- <population> 200
mise exec -- node docs/measurements/styling/benchmark-official.cjs <population> 200
cargo +1.98.1 run --release -p rsvelte_stylesheet --example layout
```

For instructions, build the CLI without `metrics`, run Cachegrind with cache and
branch simulation disabled for `rounds=1` and `rounds=2`, then subtract `I refs`.
For the old arm, extract its committed Cargo files and crates with `git archive`,
copy [the driver](benchmark-old.rs) into `crates/rsvelte_core/examples/styling_bench.rs`,
and build that example in release mode. The archive avoids a version check against
the old worktree's unrelated Svelte submodule checkout.

For CPU cycles, copy [the rewrite driver](benchmark-rewrite-cycles.rs) and
[the old driver](benchmark-old-cycles.rs) into their respective example
directories as `styling_cycles.rs`, then build each example in release mode.
On macOS, run:

```sh
mise exec -- python3 docs/measurements/styling/cycles.py <population> \
  <rewrite>/target/release/examples/styling_cycles \
  <old>/target/release/examples/styling_cycles /tmp/styling-cycles
```

The driver builds the small C adapter against the installed macOS SDK.
It rejects unavailable or non-advancing counters and empty populations.

Kernel/CSS tests and Clippy passed. Semantic checking passed with existing lint
failures suppressed. Workspace tests, strict Clippy, format, and structure found
failures in other active changes; their logs are saved beside this report.
Whole-corpus compilation time, Vite/HMR, and other CPU architectures are
**UNMEASURED**. The unparsed corpus prevents a claim of complete styling coverage.
