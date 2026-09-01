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

## Where the client's time is (2026-09-02)

Two instruments, same 3000-file slice. Read them together: the phase table says
which *stage* owns the time, the profile says which *function*.

`compile_profile --features measure-pa-split,measure-tf-split --dir=…` (shares
of one client compile; the feature's own timers cost ~1.3% and are included):

| stage | share |
|---|---:|
| Phase 1 parse | 1.9% |
| Phase 2 analyze | 27.5% (resolve-lazy 2.4, OXC script parse 6.5, visitors 18.7) |
| Phase 3 transform | 70.6% |
| — CSS render | 17.1% |
| — script-text transform | 16.3% |
| — unattributed phase-3 remainder | 12.0% |
| — JS codegen | 10.9% |
| — template fragment | 10.0% |
| — assembly | 5.1% |

samply, self-time, after removing the 8.77% that is `perf_bench`'s own
`fs::read_to_string` (`libsystem_kernel!read` 7.53 + `__open` 0.81 + `close`
0.43 — confirmed by walking each leaf's callers to `perf_bench::main`):

| function | share of compile work |
|---|---:|
| `Cloned<I>::fold` | 11.7% |
| `_platform_memmove` | 5.3% |
| hashing (SipHash + hashbrown + indexmap) | ~5.4% |
| string search (memmem + `str::pattern`) | ~4.5% |
| allocator (`mi_malloc`/`mi_free`/`madvise`) | ~4.0% |
| `copied_spans_for_normalized_code` | 1.8% |
| `collect_dollar_identifiers_pass` | 1.4% |

`Cloned<I>::fold` is `chars[i..].iter().collect::<String>()` in
`css::replace_animation_keyframes`: **425 of its 425 samples have
`render_stylesheet_internal` as their caller**, so the attribution is not a
guess. Its sibling `to_lowercase` on the next line adds 0.71% (26 of 28 samples
from the same caller), for 12.45% together — which an independent SSR
measurement put at 12.6%.

**Nothing else is a lever.** The second instrument confirms the first: after the
CSS row, no function exceeds ~5% and every one of those is diffuse
infrastructure rather than a call site. Inside `script-text transform`,
`process_accumulated` (7.8% of compile) splits into 22 stages whose largest is
0.97%; their `work` columns are all ~1.47-1.51 MB over ~8,497 statements, i.e.
**22 independent full scans of the same statement text** — a structure worth
gating with one marker prescan, but worth ~3-4%, not 15%.

## Parallel efficiency: what has been ruled out

- **Task-length spread is not the cause.** Per-file times dumped from a
  sequential run (`perf_bench --dump-times`) give a total of 2107.2 ms with a
  largest single file of 133.6 ms, against a 10-way ideal share of 210.7 ms — so
  the biggest task fits inside one thread's share and LPT reaches 100% for
  N = 2..12. This assumes a sequential task-length vector transfers to the
  parallel case, which contention would break; `--dump-times` now also works
  under `--threads N` so the same LPT calculation can be run on the parallel
  vector instead of assumed.
- **Kernel/VM contention is not the cause.** `ru_stime` is 2.7 ms at one thread
  and 7.9 ms at ten, against hundreds of ms of CPU. `madvise`/`mmap` under the
  process VM lock cannot hide there.

What remains: efficiency cores (8P + 2E caps a 10-thread pool near 8.7x) and
user-space memory contention. `perf_bench --qos background` confines a thread to
the E cores, which measures the P/E ratio for this workload as a load-robust
*ratio* rather than an absolute.
