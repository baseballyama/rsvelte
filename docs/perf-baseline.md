# Canonical baseline — quiet machine, 2026-09-02 04:17-04:21 JST

M2 Pro (10 cores), load avg 2.4-3.8, no other builds running.
3000 corpus files via even stride over `compatibility/manifest.json` components
(6,304,680 bytes; 2887 accepted by both compilers).
Official = `submodules/svelte/packages/svelte/compiler/index.js` (5.56.8),
options `{filename, generate, dev:false, css:'external'}` — the report's own
`optionsFor`. rsvelte = `target/release/{perf_bench,benchmark_runner}` at
`e9fe42c04`, `enable_sourcemap` at its shipping default (`true`) on both sides.

| target | official | rsvelte single | rsvelte multi | single | **multi** |
|---|---:|---:|---:|---:|---:|
| client | 3554 ms | 1199.6 ms | 250.4 ms | 2.96x | **14.19x** |
| server | 3234 ms | 1059.6 ms | 255.5 ms | 3.04x | **12.66x** |

Parallel efficiency 4.83x on 10 cores (was 4.24x before the deferred AST).

## Reproduces the published report exactly

Before `c4e32d4a9` this same harness measured client 2931.7 ms, i.e.
3554/2931.7 = **1.21x** single and 5.14x multi — the two numbers
`apps/playground/static/performance-report.json` carries. The harness is sound;
what moved is the compiler.

## Ablations (single-thread, CPU_min)

| | client | server |
|---|---:|---:|
| as shipped | 1199.6 ms | 1059.6 ms |
| `--no-sourcemap` | 1053.6 ms (−12.2%) | 743.5 ms (−29.8%) |
| `--no-ast` | 1202.2 ms (±0) | — |

`--no-ast` matching the default is the check that the AST really is deferred.

## Measurement protocol

Wall clock AND `getrusage` CPU time both move 2-3x with machine load — memory
bandwidth and LLC contention inflate cycles, not just scheduling. The same
binary on the same input measured 1172 ms and 2414 ms an hour apart. So:

- Absolute numbers are only comparable inside one announced quiet window.
- Between windows, report the RATIO from an interleaved A/B (`/tmp/ab.mjs`,
  ABBA per round) rather than an absolute.
- Record `uptime`'s load average beside every number.
- `benchmark_runner`'s parallel mode is `--mode multi`. `--mode parallel` is
  accepted and silently runs single-threaded.

## The deferred AST is byte-identical

`crates/rsvelte_devtools/src/bin/ast_hash.rs` prints one hash of
`compile()`'s `result.ast` per (file, mode). Run on both sides of `c4e32d4a9`
over 1,500 corpus components × {client, server, modernAst} = 4,500 pairs:
**0 differing hashes**. Deferring the conversion changed when it runs, not what
it produces.
