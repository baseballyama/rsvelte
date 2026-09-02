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

## Where the merged tree actually stands (2026-09-02 09:00, NOISY machine)

The 14.19x / 12.66x in the table above is `e9fe42c04`, **before** the three
branches merged. Re-measured on `f06fe4f29`, same 3000-file slice, official
re-run rather than quoted:

| | official (ms) | rsvelte single | multi min/min | multi med/med | published |
|---|---:|---:|---:|---:|---:|
| client | 3434.8 min / 3556.3 med | **3.44x** | 17.7x | 16.3x | 5.14x |
| server | 3157.1 min / 3197.8 med | **3.84x** | 20.3x | 16.3x | 5.06x |

**The multi figure is not resolved and this machine cannot resolve it.** Load
went 3.1 to 6.3 during a 90-second run and the six block minima span 193.7-255.3
(32%); the two columns differ by the choice of statistic alone, and mixing them
(official min over rsvelte min) is the error that produced a withdrawn 1.354x
earlier the same day. Read 16.3x as the defensible number and 20x as unproven.
A definitive figure needs the box idle — a 22.6 GB resident `llama-server` held
free memory at 12-13% throughout.

## A single-thread ablation buys about half of itself in wall clock

Measured with `--no-sourcemap`, which removes a known ~12-15%, on both arms:

| | CPU_min ratio | wall_min ratio |
|---|---:|---:|
| `--threads 1` | 1.172 | — |
| `--threads 10` | 1.182 | **1.094** |

The CPU ratio is the same at 1 and 10 threads, so the work really is removed
proportionally — but wall clock moves only 1.094, a **transfer of 55%**. At ten
threads the critical path is the slowest worker, and taking work off every
thread shortens the average more than it shortens that path.

This matters because every candidate improvement in this campaign is quoted as
a **single-thread** ablation and then multiplied into the **multi** speedup the
report publishes. That multiplication overstates by roughly a factor of two.
The transfer was measured on one ablation, which is spread across the compile;
a localized one may transfer differently. Do not multiply a single-thread
ablation into a parallel ratio without measuring the transfer for it.

## The batch pool's thread count is not established

`RSVELTE_BATCH_THREADS` makes the arms one binary and one tree differing only
in an environment variable, so no artifact can be mislabelled. Eight ABBA
blocks of five iterations, client:

| statistic | verdict |
|---|---|
| best block | **10 threads faster, 1.049x** |
| median of block minima | 6 threads faster, 1.126x |

The sign flips with the statistic, and blocks 5-8 degraded in both arms
together, which is a time trend rather than an arm effect. The earlier
"6 threads, 1.13-1.22x" range does not contain this result. `in_batch_pool` is
public and `benchmark_runner` can install it, but that change is **not
committed**: it moves a published number on unestablished evidence.

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
**22 independent full scans of the same statement text**. Reading the stages
rather than the timers lowers what a marker prescan is worth: each already
guards on its own variable set being non-empty, so what a prescan adds is a
per-statement check for the three that guard only on `!analysis.runes`
(`state_assigns`, `prop_assignments`, `state_reads`). Call it ~2%, not the 3-4%
the timer table alone suggests — and nowhere near 15%.

The CSS row's 12.45% also needs its population stated: only **26 of the 3,000
sampled files carry an `@keyframes`** (0.87% of the files, 2.71% of the bytes;
316 of 33,897 across the whole corpus). That is the signature of a quadratic
rather than a contradiction — those 26 average 6,570 bytes against the sample's
2,101 — but it means the A/B's run-to-run spread is concentrated in 26 files,
and that the two instruments agreeing agree **on the same sample**, not on
independent populations.

## Parallel efficiency: the pool may be sized to the wrong number

**Measured 2026-09-02 05:57-06:00, one quiet window, every spec run forward and
then in reverse order.** `perf_bench --threads N`, client, 3000 files, 3 runs
after a warmup, `CPU_min` / `wall_min` (best of the two orders):

| pool | wall | speedup vs 1 thread | CPU | CPU vs 1 thread |
|---|---:|---:|---:|---:|
| 1 | 1156.5 ms | 1.00x | 1156.4 ms | — |
| **6** | **208.9 ms** | **5.54x** | 1234.7 ms | **+6.8%** |
| 8 | 267.2 ms | 4.33x | 1628.2 ms | +40.8% |
| 10 (`available_parallelism`) | 282.8 ms | 4.09x | 1756.1 ms | +51.9% |
| 12 | 267.2 ms | 4.33x | 1629.0 ms | +40.9% |

The cliff sits at this machine's performance-core count. **Read the wall column
only together with *The 1.354x was max-of-one-arm over min-of-the-other* below:
each row here is one run, the window held four same-configuration ten-thread
runs whose wall clock spanned 236.4-284.1 ms, and the row below is the slowest
of them.** The CPU column is the one that separates cleanly and has since
reproduced.

**An efficiency core runs this workload at 0.22-0.24x a performance core** —
`--qos background`, which macOS confines to the E cluster, measures `CPU_min`
4928.3 / 5497.8 ms against `--qos interactive`'s 1159.1 / 1198.0. That is a
measurement, replacing the 1/3 figure this file used to quote as a guess.

The CPU column is what identifies the mechanism rather than merely reporting it.
If a fraction `f` of the work lands on cores that are `1/0.227` times slower,
total CPU inflates by `1 + 3.4f`; inverting the measured inflation gives an
E-core work share of 12.0% at eight threads, 15.2% at ten and 12.0% at twelve,
against 7.0% / 13.1% / 13.1% predicted by splitting work in proportion to core
speed. The model fits, so the extra CPU is E cores doing work slowly — not lock
contention, not allocator contention, not cache thrash.

**And the additive ceiling is refuted by its own arithmetic — under either
reduction.** `6 + 4x0.227` is 6.91x against 6.00x for a P-only pool, so on paper
the four E cores should *add* 15%. Reducing both arms by minima they subtract
12% (5.54x at six workers, 4.89x at ten); by medians, 18% (5.38x, 4.42x). The
cost of heterogeneity exceeds what the slow cores contribute either way, which
is a statement about the scheduler rather than about the cores. The packing
numbers put a size on it: six workers reach 92% of `sequential / 6` (90% on
medians), ten reach 71% of `sequential / 6.91` (64%).

Separate the two strengths here, because they are not the same claim.
**Measured:** the cliff in CPU sits at the performance-core count, and the CPU
inflation inverts to an E-core work share that matches a speed-proportional
split. **Weak positive, effect the size of the noise:** that six workers finish
sooner. **A consistent explanation, not verified:** that
rayon splits a range by item count and a worker which is 4.4x slow is not an
*idle* worker, so it holds a chunk sized for a fast core and becomes a tail no
steal recovers. Rayon's splitter is adaptive and stealing does happen, so
"cannot be stolen" is very likely too simple. The evidence that does bear on
the splitter is the `--sort` result below — an ordering that is optimal for a
weight-aware scheduler and 2.2x pessimal here is direct evidence that the split
is by index rather than by weight. **The pool-size conclusion does not rest on
the mechanism** being right.

Three supporting measurements, all from the same window:

- **QoS pinning adds nothing; the thread count is the whole effect.**
  `--threads 6 --qos interactive` is 208.9 / 218.4 ms against plain
  `--threads 6`'s 246.2 / 211.4 — inside the spread. macOS already puts six
  threads on the P cluster. No `pthread_set_qos_class_self_np` is needed in the
  product.
- **Per-file slowdown is not size-correlated, so it is not cache contention.**
  The `t10/t1` ratio over the same 3000 files has median 1.10, and splitting by
  size gives 1.10 for the 137 files >= 8 KiB against 1.11 for the 1491 under
  800 B. What the distribution does have is a tail — p95 3.51, p99 7.41 — which
  is the E-core arm of a bimodal population, not a gradient in file size.
- **Load imbalance is not the cause, now measured rather than assumed.**
  `--dump-times` under `--threads 10` gives the task-length vector *as the
  parallel run experienced it*; LPT recomputed on that vector reaches 100%
  efficiency on all three runs, with a largest task of 79-85 ms against an ideal
  share of 163-187 ms. This closes the transfer assumption the earlier
  sequential-vector version of this bullet rested on.

**`--sort` (longest-processing-time-first ordering) makes it 2.6x worse**, at
616.9-660.6 ms against an unsorted ten-thread minimum of 236.4 (2.2x against
that arm's slowest run — the direction of this one does not depend on which
statistic, which is why it is the only wall result here worth quoting), with
parallelism falling to 2.2. Rayon splits a
slice by *index range*, so presenting the work in descending size order
concentrates every heavy file in the leftmost ranges — the ordering LPT theory
recommends is the one rayon's splitter handles worst. Recorded as a documented
negative: do not reach for it again.

`MIMALLOC_PURGE_DELAY=-1` measured 296.0 ms forward and 233.2 ms reverse. That
spread is larger than the effect being looked for, so it is **unresolved**, not
a result.

### The 1.354x was max-of-one-arm over min-of-the-other

The window ran four plain ten-thread client measurements, not one — the `t=10`
spec forward and reverse, plus the four-surface headline sweep and the
`--dump-times` run, all the same configuration. Collected:

| arm | min | median | max | within-arm spread |
|---|---:|---:|---:|---:|
| wall, 6 threads | 208.9 | 214.9 | 246.2 | +17.9% |
| wall, 10 threads | **236.4** | 261.9 | 284.1 | +20.2% |
| CPU, 6 threads | 1234.7 | 1256.9 | 1291.1 | +4.6% |
| CPU, 10 threads | 1523.6 | 1651.5 | 1841.9 | +20.9% |

**The wall ranges overlap**, and the 1.354x quoted above is `max(t=10) /
min(t=6)`. Like for like it is 1.13x on minima and 1.22x on medians, against a
within-arm spread of 18-20% — the effect and the noise are the same size.
Three of the four six-thread runs do come in under all four ten-thread runs
(rank sum 1,2,3,6 of 8, one-sided p ~ 0.06), so this is weak positive evidence,
not a null. It is not a measurement of 1.354x.

**And it dissolves the discrepancy that looked like a harness defect.**
`benchmark_runner`'s 233.0 ms sits just below `perf_bench`'s own ten-thread
minimum of 236.4 — the two instruments agree, and the "loaded machine produced
the faster number" puzzle was created entirely by comparing that harness against
the *worst* of my four same-configuration runs. Nothing needs explaining about
`--warmup`, the allocator (both binaries set `mimalloc`), the timed region, or
what `compile()` each one calls. The defect was arm selection.

**The CPU column is the one that survives**, and it is clean: `max(t=6)` =
1291.1 is below `min(t=10)` = 1523.6, so the ranges do not overlap at all, and
the loaded re-run reproduced the direction in 6 of 6 ABBA pairings (round means
1.13x, 1.23x, 1.15x). A six-worker pool does the same work for 20-33% less CPU.

| claim | status |
|---|---|
| a 6-worker pool uses less CPU | **reproduced** — disjoint ranges in the window, 6/6 pairings under load |
| an E core runs this at 0.22-0.24x a P core | measured once, mechanism-level |
| a 6-worker pool is faster in wall clock | **weak positive, ~1.1-1.2x, effect ≈ noise** |
| **1.354x, and the 22.71x / 20.45x it projected** | **withdrawn — an artefact of arm selection** |

Two rules come out of this, and the first is the one that was actually broken.
**Take the same statistic from both arms.** Min-vs-min and median-vs-median each
answer a question; min-vs-max answers none, and it is the easiest mistake to
make when the arms were not run as pairs — the extra ten-thread runs arrived
from *other* parts of the battery (a headline sweep, a dump run) and were never
lined up against the six-thread rows. **Print the within-arm spread next to
every ratio**: 1.354x with `±20%` beside it would not have been believed for
the twenty minutes it was.

The measurement that would settle the wall question: a quiet window, both
binaries, interleaved ABBA, at least four rounds per arm, reporting min, median
and spread per arm. If the effect is 1.1-1.2x against an 18% spread, four rounds
is the floor, not a comfortable margin.

**And the change does not reach the published report at all, as the harness
stands.** The pool is installed by `compile_batch*`, which is what the NAPI
`compileBatch` export and therefore `@rsvelte/vite-plugin-svelte` call.
`benchmark_runner --mode multi` does not: `run_multi_threaded` is a bare
`files.par_iter().for_each(|| process_file(...))` calling `compile()` one file
at a time on rayon's global pool. So the report's multi column is unaffected
whatever the wall question resolves to. Pointing the benchmark at
`compile_batch` would change that — and would also be changing the benchmark to
move a number, which needs to be argued on its own merits (it *is* the entry
point a bundler uses, which is the argument for it) rather than slipped in
beside a performance change.

**What the surviving claim is worth, stated narrowly.** 20-33% less CPU for the
same work is real for anything billed or budgeted in CPU-seconds — CI minutes, a
laptop's battery. It is *not* a claim that the machine is freer for other
processes: what shrinks is this process's CPU-seconds, and if wall clock is
unchanged then its occupancy of the machine is unchanged too. The E cores do
come free, which would be that claim — and it has not been measured.

## The deferred AST changes what the two arms do, and that has to be stated

`benchmark_runner` calls `rsvelte_core::compile()`; `run-performance.mjs` calls
official's `svelte.compile()`. Official's sets `result.ast = to_public_ast(…)`
unconditionally (`compiler/index.js:58`) — for the legacy shape that is a full
`convert(source, ast)` walk. rsvelte's now defers the same field to its first
reader, and neither the benchmark nor a bundler ever reads it. So after
`c4e32d4a9` the arms no longer perform the same work, and the report's speedup
column includes that difference.

It is still the comparison a bundler experiences, which is why it stands:
`@sveltejs/vite-plugin-svelte` calls `svelte.compile()` and is charged for the
AST whether it wants it or not, and `@rsvelte/vite-plugin-svelte` is not.
But the report should say so in `provenance.benchmarkDesign` rather than leave a
reader to infer that both compilers built the same outputs.

Note the direction this cuts. Before the change the *benchmark* was the outlier,
not the product: `@rsvelte/vite-plugin-svelte` reaches
`binding.compileEnvelopeExternalSources` → `compile_without_ast` and has never
built the AST, so `benchmark_runner` was measuring a path no rsvelte consumer
uses.

## An rsvelte NAPI probe has two arms too, and only one of them ships

`apps/npm/vite-plugin-svelte-native/index.cjs` **wraps** the binding: its
`compile()` routes to `binding.compileEnvelopeExternalSources` unless
`modernAst` is set, and only `compileLegacy` reaches `binding.compile`. Measured
over 1,477 corpus components, ABBA:

| entry | min |
|---|---:|
| wrapper `compile()` (what the plugin imports) | 2119 ms |
| `binding.compile` (raw `.node`, JSON + AST) | 8105 ms |

3.82x apart, and the two arms agree: `js.code` + `css.code` hashed **per file**
over the same 1,477 gives 0 differing and 1,477 distinct hashes, with a
one-byte control the comparison detects. A summed output length would not have
shown this — two files differing by +3 and -3 bytes sum the same, and
`compile_result_to_json` and `decodeEnvelope` are different serializers.

A probe that `require`s the `.dylib` directly measures the second
one and reads as a finding about the product. It is not — it is the same shape
as *Three things answer to "the official compiler"* in AGENTS.md, one level
over: **`require` the package, not the artifact.** This cost one wrong
conclusion ("the Vite plugin gets no benefit from the deferred AST") that a
grep for `svelte.compile(` appeared to support and that measuring the shipped
wrapper immediately refuted.

## "Pre-frag setup 11.7%" was a residual with a guessed label

`compile_profile.rs:354` computes that row as `transform_time` minus six
timers and `:667` prints it under a name asserting what is in it. A residual
always makes the table sum to 100%, so the row reads as surveyed. Decomposed
by adding three timers (instrumentation, not committed), on the profiler's own
3889-file corpus:

| bucket | share of compile |
|---|---:|
| CSS render (already had a row) | 4.6% |
| map assembly — `MappingLineStarts`, the mapping classification loop, the sort | 3.6% |
| map serialize — VLQ encode + sourcemap JSON + `remap_through_sourcemap` | 3.4% |
| pre-script — dead comments, rune parens, prop sanitization | 2.2% |
| still unattributed | 6.2% |

Three things this cost, all of them method rather than result.

**The hypothesis was wrong and the instrument was wrong in the same direction.**
The 180 untimed lines between `visit_program` and the script-text transform
looked like the obvious home for 11.7%; they are 2.2%. And the timer written to
catch the rest spanned `3_transform/mod.rs:337-689`, which **contains the CSS
render timer at :380-388** — so `map serialize` first read 8.0%, and `other`
had CSS subtracted twice and first read 1.6%. A peer found it from an
arithmetic contradiction, not from the code: their server profile put the same
serialization at ~1.7% while the server sorts 4.5x more mappings than the
client, and 8.0% cannot be reconciled with that.

**A wrong instrument rejects the correct hypothesis.** With the over-wide
timer, map work summed to 11.6% against a `--no-sourcemap` ablation of 12.2%,
which reads as two independent measurements agreeing and leaves 0.6% for the
~13 scattered `enable_sourcemap` sites. Corrected, map work is 7.0% and the
scattered remainder is 5.2% — which is what the original reading of that code
claimed. The agreement was the artifact.

**`Phase3Breakdown` is summed field by field at `compile_profile.rs:181`.**
Adding a field to the struct compiles and the new bucket silently reports
`0.00ms`, which is indistinguishable from a timer that never fires; that
misdiagnosis cost one build. And `compile_profile` calls `analyze_component`
and `transform_component` **directly** (`:130`, `:174`), the same
entry-point mismatch the `perf-loop` skill documents for `profiler.rs` and does
not mention for this binary — `analyze_component` hard-codes
`retained_scripts: None`, so the pre-script row above is an upper bound.

The operational conclusion is negative: net of the CSS render nested inside it,
**source-map serialization is 3.4% of client compile**, so removing all of it
buys 1.035x. It is not a lever toward the throughput goal, and neither is any
other single phase-3 bucket.

## The merged tree is a fourth tree, and it needed its own gate

Three branches were each green on their own — `perf/pool-sizing`,
`perf/resync-window`, `perf/css-keyframes` — and all three touch
`3_transform`. Three greens are not a fourth green: the merge is a tree nobody
had compiled, and a file-set-disjoint merge (which this was, zero conflicts)
says nothing about whether the *behaviours* interact.

Measured on `ef4247f80` at 2026-09-02 07:42-07:54: **1973 passed, 0 failed**
across seven binaries — `--lib` (1956), `compiler_fixtures`, `css`,
`css_keyframes_property_case_folding`, `sourcemaps`, `sourcemaps_gate`, `ssr`.
Read the `Running` lines and the seven `test result:` denominators, not
`TESTS_EXIT`: a run that fails to *compile* also exits through this path, and
the two are indistinguishable from the status alone.

Two process notes that cost real time here. A `cargo test` launched from a tool
wrapper dies with the wrapper — three runs in a row were killed at 3-11 minutes
with no OOM or jetsam entry in the system log, which reads exactly like a
memory failure and is not one; `nohup … & disown` survives, and macOS has **no
`setsid`**, so a launcher built around one silently does nothing while printing
whatever `echo` follows it. And editing a source file mid-run does not
invalidate the run: cargo fingerprints at planning time, so the in-flight
binary is the tree as of launch. That is a *correct* verdict for the commit and
a *stale* one for the working tree, so a second `--lib` pass is the only thing
that speaks for what is on disk.

## Regenerating the published report

`pnpm report:performance` (`scripts/reports/run-performance.mjs`) is the
authoritative number — `perf_bench` and `benchmark_runner` are proxies validated
against it, not substitutes. It needs the collected corpus, a built
`submodules/svelte/packages/svelte/compiler/index.js`, and
`scripts/bench/competitor-oracle/node_modules`; all three were present on
2026-09-02. Three knobs, and no way to skip the competitor arms:
`REPORT_WARMUPS` (1), `REPORT_RUNS` (5), `REPORT_FILE_LIMIT` (0 = all 33,897).

It runs four surfaces × {official, rsvelte-single, rsvelte-multi} × 5 runs over
33,897 components at ~39 s per official run, so budget the better part of an
hour of exclusive machine. `REPORT_FILE_LIMIT=3000 REPORT_RUNS=3` is the smoke
test; only the unrestricted run may be committed.

Baseline it replaces (single / multi speedup): client 1.21x / 5.14x, server
1.24x / 5.06x, client-dev 1.20x / 5.40x, server-dev 1.27x / 5.00x.
