# Where the 20x goal stands (2026-09-03 07:00)

**Read this first; everything below is the working record, newest sections near
the top.**

Measured on a quiet box at `9c771271f` — every competing process suspended, every
binary built *before* the run opened, and `benchmark_runner`'s SHA-256 identical
before and after (#4213).

| surface | single | multi | status |
|---|---:|---:|---|
| server | 3.70x | **20.42x** | **met** |
| server-dev | 3.65x | 19.64x | 1.8% short — inside the deciding arm's own ~5% within-run drift, so undecidable |
| client | 3.36x | **17.22x** | short by **1.161x** |
| client-dev | 3.00x | 14.63x | short by 1.367x |

**The previous client figure (9.63x) was the box, not the compiler, and the
control that says so is internal to the pair.** Between the two runs the
single-threaded arms moved -1.4% to +3.6% while the client's multi arm moved
**+78.9%**. No compiler change produces that pair — the single arm runs the same
code. A flat single arm beside a moved multi arm is the signature of box
contention, and it is what names the old number, rather than any argument about
what happened to be running at the time. The three routes that had estimated a
clean client run at 15.6-17.7x, 17.2x and 15.34x all bracket the measured 17.22x,
but they were estimates and this is the measurement.

**What remains is one factor: 1.161x on client single-threaded compile time.**
A speedup is `single-thread speedup x parallel efficiency`; a `--threads` sweep
shows client and server scale identically in prod mode, so the scaling half is
not a deficit.

**Where that 1.161x could come from**, re-sampled at `477b51f13` after the
`skip_opaque` guard shipped (6,950 self-time samples, single-threaded client,
`/usr/bin/sample`):

| mechanism | self-time | if fully removed |
|---|---:|---:|
| `_platform_memmove` | 9.25% | 1.102x |
| byte scanning (`str::pattern`, `memmem`, `js_scan`, the client scanners) | ~12.5% | 1.143x |
| hashing (SipHash + IndexMap + hashbrown) | ~9.0% | 1.099x |

**No single non-architectural lever is 13.9% wide.** The two that are wide enough
are the ones the architecture notes already name — the AST pipeline (which is
what makes byte scanning unreachable) and leaving `serde_json::Value` — and both
are multi-week. The standing caution holds: a self-time share is an upper bound
on what becomes *unreachable*, not a saving, because an AST pipeline pays its own
walk.

**`_platform_memmove` cannot be attributed from this profile and that is a fact
about the instrument.** 7.18% of the 9.25% appears as a direct child of `start`
in the call graph — the unwinder gives up inside a leaf assembly routine — so
only 2.07% has a named caller (`esrap::Driver::append` 0.98%,
`RawVecInner::finish_grow` 0.85%, `Context::write` 0.73%, then nothing above
0.36%). That shape is consistent with the recorded finding that the allocation
bucket has no single site, and inconsistent with nothing; it is not evidence
either way, and a frame-pointer build would be needed to make it one.

**The two largest rsvelte-owned symbols, and what is known about each:**

- `client::copied_spans_for_normalized_code` — 2.73%. It walks the generated
  script text against the source byte by byte to rebuild the map. Its
  `source_at_output` per-byte table (`vec![None; stripped.len() + 1]`, plus an
  inner loop over every byte of every matched run) is built only when a
  `ScriptProjection` exists, and `ScriptProjection` is produced only by
  `strip_typescript` — so it is a TypeScript-only cost, and the 2.73% is mostly
  the general walk rather than the table. **Unmeasured:** the split between the
  two.
- `phase2_analyze::store_subscriptions::collect_dollar_identifiers_pass` — 2.50%,
  plus `blank_comments` at 0.81%. It decodes each script to `Vec<char>` and scans
  it **twice**. A `$`-absent guard is exact (no `$` byte means neither pass can
  emit anything) and would skip both, but only **27.8% of corpus scripts contain
  no `$`** (2716 components with a script, measured over the same 3000-file
  stride) — and unweighted by size, so the guard is worth well under 0.7%. Runes
  spell `$state` / `$derived` / `$props`, which is why the fraction is so low.

**Eliminated by measurement, so nobody re-tries them:** the printer and its
source-map branch (client 5.09% vs server 3.34%, only 5.5% of the client/server
transform gap; a 5x-faster printer is 1.073x), and the four pre-fragment call
sites once thought to fill the residual (3.41 ms of 67.54, 5%).

**Still unexplained:** the "Pre-frag setup" residual, 15.9% of a client compile,
95% of it unnamed. Its label is wrong — only ~10 statements of object
construction run before `visit_program` — so it lives in the gaps between the
later timers, which are enumerated with their bounding lines further down.

# The 1.161x, priced against four levers (2026-09-03 07:00-08:00)

All four measured on the quiet box at `477b51f13`, single-threaded client,
`--limit 1700 --skip 1` (a slice **provably disjoint** from the PGO training set:
same `--limit` means the same stride, so `--skip 1` shares no member with
`--skip 0`), ABBA-ordered, CPU median of 9 runs, both arms' `sink` identical on
every row so the outputs are the same.

| lever | held-out | verdict |
|---|---:|---|
| PGO (`-Cprofile-generate` → 4 targets × 1700 files → `-Cprofile-use`) | **1.130x** | real, and the largest single lever measured |
| `-Ctarget-cpu=apple-m1` on top of PGO | **1.000x** | null — 519.0ms vs 519.0ms |
| removing the Phase-3 timer clock from the binary | **1.002x** | null at this precision (±0.5%) |
| the remaining need after PGO | **1.027x** | unclosed |

**PGO's in-sample number is 1.179x and its held-out number is 1.130x**, so the
overfit is 4-5 percentage points. Measuring only in-sample would have reported a
lever that is a third larger than it is. Server is 1.118x, so SSR does not
regress. `llvm-profdata merge --sparse` takes the profile from 14.2 MB to 6.3 MB
(1.5 MB gzipped); shipping it means either checking that in or training in
release CI per platform, and neither has been decided.

**The timer-clock result retires a number this file used to carry.** A sampled
profile scores `mach_absolute_time` at 0.40% of self time, and that was read as
0.40% recoverable. Removing every `Instant::now()` from the shipping path
measured **1.002x** — indistinguishable from nothing. A self-time share is not a
saving; this is the same shape as the withdrawn UTF-16 column subtraction, whose
2.14% profile bound measured null. The instrumentation added below is therefore
free, which is the other half of the same measurement.

## The Phase-3 residual is 7.1%, not 15.5%

`compile_profile` now brackets the gaps in `transform_client` and in
`transform_component_with_scripts`. Measured on 3000 files, client:

| named | ms | % of compile |
|---|---:|---:|
| **client source-map assembly (after `transform_client`)** | **10.01** | **3.8%** |
| — line tables + two full scans | 5.29 | 2.0% |
| — three-way partition loop | 2.60 | 1.0% |
| — sort by (gen_line, gen_col) | 1.63 | 0.6% |
| post-codegen `rehome_derived_jsdoc` + `signal_discipline` | 3.05 | 1.1% |
| GAP dead_comments → attach_import_origins | 2.81 | 1.1% |
| GAP entry → visit_program | 1.56 | 0.6% |
| GAP visit_program → dead_comments | 1.35 | 0.5% |
| GAP script_text → fragment → assembly (three) | 0.16 | 0.1% |
| **still unnamed** | **18.87** | **7.1%** |

The largest piece is the source-map reconstruction this file and `AGENTS.md`
already name as the debt behind #2954/#3015 — it now has a position and a size.
Its dominant third is *scanning*: `MappingLineStarts::new` walks the generated
code and the source, `template_source_lines` walks the source again, and
`mark_lines_containing` walks the generated code again. Two of those four passes
are fusible into the other two without changing any output. **Unmeasured:** what
that fusion actually buys.

**One hypothesis was raised and falsified on the way.** `compile_profile`'s
Phase-3 denominator is the loop's wall clock, which also contains the binary's
own per-file bookkeeping — `take_breakdown` resets thirty thread-locals,
`script_shape` rescans the source, two `Vec`s grow — so the residual could have
been the instrument charging itself to the compiler. Measured by summing the
per-file `transform_component` brackets against the loop wall: **2.98 ms of
181.65 ms, 1.6%**. It is not the residual's cause. The denominator is now printed
either way, because "the residual is 15% and unexplained" is a claim about a
denominator nobody had stated.

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

## The authoritative report: 14.35x client, 18.83x server (2026-09-02 13:36)

Unrestricted `pnpm report:performance`, 33,890 components / 69.8 MB, 5 runs per
arm, on `1ef536327`:

| surface | multi, before -> after | single, before -> after |
|---|---|---|
| client | 5.14x -> **14.35x** | 1.21x -> 3.45x |
| server | 5.06x -> **18.83x** | 1.24x -> 3.81x |
| client-dev | 5.40x -> **13.25x** | 1.20x -> 3.04x |
| server-dev | 5.00x -> **17.57x** | 1.27x -> 3.70x |

**This is below the 22.64x / 25.61x the 3000-file slice measured on the same
tree, and the slice was wrong.** The gap is entirely on rsvelte's side —
official costs 1.19 ms/file on the slice and 1.17 on the full corpus, flat,
while rsvelte costs 0.0526 and 0.0818.

### What the gap is, measured

Not corpus size. Running the *slice* for 60 iterations back to back — about
eleven seconds of sustained work — the median rises 172.6 ms to 234.3 ms while
the **minimum does not move** (165.1 to 149.6). And 234.3 ms over 3000 files is
0.078 ms/file, which is the full corpus's 0.0818. The slice and the corpus cost
the same per file once both are measured under sustained load; a 0.15-second
burst simply does not stay in that regime long enough to show it.

Not thermal either. The same box, the same minutes:

| arm | sustained | degradation |
|---|---|---|
| single-threaded, 20 iterations | ~20 s on one core | **1.020** |
| ten threads, 60 iterations | ~11 s on ten | **1.36** |

A single core flat out for twenty seconds loses 2%. The loss needs the other
nine threads. But it is **not a stable property of the thread count** — a later
pair measured 1.292 at four threads against 1.100 at ten, the wrong way round
and both different from the first run. What varies run to run is the rest of
the box, which had load 4.5-6.2, 5-13% free memory, a 22.6 GB resident
`llama-server`, and macOS `mediaanalysisd` and Spotlight indexing throughout.

The comparison is therefore **asymmetrically handicapped**: official is a
single-threaded Node process and needs one core, so contention barely touches
it (2%); rsvelte's parallel arm wants all ten and gets what is left. The size
of the handicap is whatever else is running. On the same run the ten-thread arm
had a best sample of 147.3 ms (**23.3x**) and a median of 232.8 ms (**14.8x**),
and the published full-corpus figure is 14.35x — the median-under-contention.

**Do not read 14.35x as an idle-machine number and do not read 23.3x as one
either.** The first is measured under known contention; the second is a
best-sample figure of the kind this document has already withdrawn once. The
number this project should publish needs an idle box, and that is the one
input nobody here can supply.

## A sampled client profile, and what the 1.161x could come from (2026-09-03 00:35)

`/usr/bin/sample` on a single-threaded `perf_bench --target client` run,
17,280 top-of-stack samples over 544 symbols. Self time, so a caller's cost
appears under the leaf it calls:

| mechanism | self-time |
|---|---:|
| oxc parser / lexer | 13.6% |
| memmove + memcmp | 9.8% |
| string search (`str::pattern`, `memmem`) | 9.0% |
| hashing (SipHash + IndexMap) | 6.6% |
| esrap printer | 5.5% |
| mimalloc | 3.8% |
| `js_scan` byte scanning | 3.5% |
| `store_subscriptions` (phase 2) | 2.9% |
| `program_to_oxc` | 2.4% |
| `copied_spans_for_normalized_code` | 2.3% |
| everything else | 41.3% |

**Three cross-checks, and the third is the instructive one.** Byte scanning
(9.0 + 3.5 = 12.5%) against the 11.53% this file already records for the client
from a separate profile — two independent derivations agreeing to about one
point, which is the pattern this repo says actually catches errors. The esrap
printer at 5.5% self against `esrap_share`'s 5.09% inclusive. And
`program_to_oxc` at **2.4% self against the 5.3% its new timer reports** — not a
contradiction but a units difference: the timer is inclusive, the profile is
self, so the conversion's allocation and copying land under `mi_malloc` and
`_platform_memmove`. Quote 5.3% for *what removing it saves* and 2.4% for *its
own code*, and never the two in one column.

Sizing against the client's 1.161x target:

| mechanism | share | if fully removed |
|---|---:|---:|
| byte scanning | 12.5% | 1.143x |
| hashing | 6.6% | 1.071x |
| both | 19.1% | 1.236x |

Both together would clear 1.161x. **They are also the two the architecture notes
already name** — the AST pipeline for the first, leaving `serde_json::Value` for
the second — so this profile is a confirmation of the existing plan, not a new
direction, and the standing caution applies unchanged: 12.5% is an upper bound
on what becomes *unreachable*, not a saving, because an AST pipeline pays its
own walk. `copied_spans_for_normalized_code` (2.3%, client-only, third-largest
rsvelte symbol) is the one item here that is neither of those and has not been
looked at.

## program_to_oxc is 5.3% of a client compile and the server pays none of it (2026-09-03 00:28)

`program_to_oxc` had no timer at all. Measured, 3000-file slice:

| | client | server |
|---|---:|---:|
| `program_to_oxc` | **23.00 ms (5.3% of compile)** | **0.00 ms** |
| `JS codegen` bucket | 58.98 ms (13.6%) | 0.00 ms |
| total | 435.00 ms | 284.84 ms |

The server's `0.00` is a second discriminating probe, not a missing number: the
server builds its oxc program directly and never calls this. The conversion is
**39% of the client's codegen bucket**, and removing it entirely would be
**1.056x** — about 36% of the 1.161x the client needs. Necessary-looking and not
sufficient, and it is an architectural change (build oxc directly, as the server
already does), not a local optimisation.

**The residual is not where it went.** `to_oxc` sits inside the `codegen` timer,
so it is outside the residual; the true unnamed residual is 70.41 − 3.41 =
**67.00 ms, 15.4% of compile**, still the largest unexplained item.

**The tool misreported this for the second time, the same way.** `still unnamed`
is computed as `residual − sum(prefrag)`, and it subtracted `to_oxc` — a
quantity in a different bucket — printing 43.91 ms where the answer is 67.00.
The first instance was the positive control; this one was predicted in advance
and happened anyway, because prediction is not a defence. Slots now declare
their bucket next to their label (`PREFRAG_IN_RESIDUAL`) and the tool subtracts
only the ones inside, which is the same fix shape as the `AddAssign`: put the
requirement where the person adding a slot is already looking.

## Deficit #2 does not exist in prod mode, and the target is one factor (2026-09-03 00:13)

A `--threads` sweep on both targets, 3000 files, wall clock normalised to the
1-thread arm:

| threads | client wall | x vs 1 | server wall | x vs 1 |
|---:|---:|---:|---:|---:|
| 1 | 1029.7 | 1.00 | 814.7 | 1.00 |
| 2 | 616.5 | 1.67 | 493.4 | 1.65 |
| 4 | 309.6 | 3.33 | 218.4 | 3.73 |
| 6 | 184.1 | 5.59 | 143.4 | **5.68** |
| 8 | 181.7 | **5.67** | 151.7 | 5.37 |
| 10 | 208.6 | 4.94 | 165.8 | 4.91 |

**Client and server scale identically** — 5.67x against 5.68x at their optima,
4.94x against 4.91x at ten threads — and their CPU-time growth from 1 to 10
threads is comparable (1.46x vs 1.53x), so contention is not differential
either. **The "deficit #2" sized above at 4.57x vs 5.41x is not reproduced.**
That figure came from the *dev* pair, borrowed because the prod client run is
contaminated, and the borrowing is what failed: dev and prod are different
workloads, and the caveat attached to it turned out to be the whole story.

**This collapses the target to a single factor.** Taking the server's implied
parallel efficiency (19.59 / 3.695 = 5.30) and applying it to the client, whose
scaling the sweep says matches:

- client's clean multi speedup should be 3.248 x 5.30 = **17.2x** — which is an
  independent third route to the 15.6-17.7x already estimated for the
  contaminated run, from a different instrument
- 20x at that efficiency needs a single-thread speedup of 3.772 against today's
  3.248, i.e. **1.161x on client single-threaded compile time**
- closing deficit #1 completely (client single-x to the server's 3.695) yields
  19.59x — *just under* 20x, so deficit #1 is very nearly, but not exactly, the
  whole target

**Do not read the 6-8 thread optimum as a change to make.** Ten threads is 1.15x
worse than the optimum on both targets here, but sizing the batch pool to the
performance cores was already tried and measured **7% slower** on the full
report, and reverted (`10d72ac22`). This box was at load ~4.5 with
`mediaanalysisd` at 75%, and fewer threads winning under contention is expected
and is not a compiler improvement. Two measurements disagreeing across a load
difference is a statement about the box, not about the pool.

One incidental result worth keeping: the `--sort` (longest-first) arm is
dramatically *worse* — client parallelism 2.71 against 7.19, wall 538.6 against
208.6. Rayon's `par_iter` splits by contiguous index range, so sorting by size
puts every large file in one chunk; longest-processing-time-first is the right
idea for a work queue and the wrong one for a range split.

## The client target decomposes into two multiplicative factors (2026-09-03 00:12)

A speedup is `single-thread speedup x parallel efficiency`, and both factors are
in the published report:

| surface | single x | parallel eff. | product | measured |
|---|---:|---:|---:|---:|
| server | 3.695 | 5.30 | 19.6 | 19.59x |
| server-dev | 3.692 | 5.41 | 20.0 | 19.98x |
| client | 3.248 | (contaminated) | — | 9.63x |
| client-dev | 3.043 | 4.57 | 13.9 | 13.89x |

Give the client both server factors and it lands at 3.695 x 5.41 = **19.99x**,
and client-dev at 19.98x. **That is not a coincidence and should not be quoted
as a discovery** — it is arithmetic: matching the server on both factors puts
the client where the server already is, and the server is at ~20x. What the
decomposition buys is the *sizing of each half* and the proof that neither
suffices:

- deficit #1 (single-thread): **1.138x** — client-specific transform work that
  official does not charge the same premium for
- deficit #2 (scaling): 4.57x -> 5.41x, i.e. **1.18x**

1.138 x 1.18 = 1.34, and client-dev needs 20/13.89 = 1.44x, so even both
together are slightly short for client-dev on these numbers — the remaining
0.07x sits inside the drift already documented, and should be treated as "at the
edge", not "met".

**The honest caution about this table**: `parallel eff.` for client is taken
from the *dev* run because the prod client run is contaminated, and dev and prod
are different workloads. The two server surfaces agree closely (5.30 / 5.41),
which is why borrowing across the pair is defensible, but it is a borrowed
number and not a measured client-prod one.

## The printer is not the client lever, and neither is the source map (2026-09-03 00:10)

`esrap_share` already collects `take_esrap_breakdown()` — a per-branch print
timer covering **both** targets — and no other tool in the tree reads it;
`compile_profile` does not print it. It needed no rebuild and no new code. Over
6500 files, 5 runs, cv under 1%:

| site | share of compile |
|---|---:|
| client `print_split` | 1.51% |
| client `print_with_map` | 3.58% |
| **client total** | **5.09%** |
| server `print` | 3.34% |
| normalize | 0.08% |
| all esrap printing | 8.51% |

The client transform's excess over the server's is 95.89 ms, **31.6% of a client
compile**. The client/server printing difference is **1.75 percentage points**,
which is **5.5% of that gap**. So the printer explains almost none of deficit #1,
and the source-map branch — the hypothesis this document was carrying, on the
grounds that the client map is esrap-built while the server's is a text scan —
is 3.58% of compile and cannot carry a 1.88x transform ratio either. The tool
sizes its own ceiling: *"a printer 5x faster would cut compile() by 6.81%"*, i.e.
1.073x.

**Two candidate explanations for deficit #1 are now eliminated by measurement**
— the four pre-fragment call sites (5% of the residual) and the printer
including the map (5.5% of the gap). Both were plausible and both were wrong,
and each cost one run of an instrument that already existed.

**Both eliminations came from instruments already in the tree.** The residual
slots needed one field wired into an accumulator; this one needed nothing at
all. That is the fourth time this session that the question was already answered
by something checked in — read the instrument before designing the experiment,
and read *all* of it, because `esrap_share` is not discoverable from the
profiler that a person would naturally open.

## Deficit #1 is in phase 3, and it carries 86% of the gap (2026-09-03 00:07)

With `--target` actually honoured, the same 3889-file slice on both targets:

| phase | client | server | ratio | share of the gap |
|---|---:|---:|---:|---:|
| 1 parse | 10.04 | 8.40 | 1.20x | 1.5% |
| 2 analyze | 88.41 | 74.82 | 1.18x | 12.2% |
| **3 transform** | **204.81** | **108.92** | **1.88x** | **86.3%** |
| total | 303.25 | 192.13 | 1.58x | |

**The arm really switched, and the proof is a set of zeros.** Server reads
`0.00ms` for `Script-text xform`, `Assembly (post-frag)` and `JS codegen`,
because those timers live in `client/mod.rs` and the server path never reaches
them — the same `0.00ms` that was a defect one section above is here the
discriminating probe. A zero is a bug or a signal depending on what else must be
true when it appears; that is why the probe has to be on the output.

**The arms ran sequentially on a box at load average 39, and the reading
survives it on an internal control.** Load decay is multiplicative: it scales
every phase by one factor. Parse (1.20x), analyze (1.18x) and CSS render
(11.15 vs 10.01 = 1.11x — shared code, the positive control) all sit at a
uniform ~1.19x, while transform sits at 1.88x. A uniform factor cannot produce
a differential, so the transform-specific excess of 1.58x above it is not the
box. The absolute 1.58x total is still soft; the *localisation* is not.

**What this cannot yet say is which client bucket the excess is.** The server's
phase 3 is 108.92 ms of which 98.91 is untimed residual and 10.01 is CSS — its
path has no per-bucket timers at all, so there is nothing to diff the client's
buckets against. Instrumenting the server transform is the prerequisite for
attributing the 1.88x, and it is a different job from bracketing the client's
own residual.

Note the published report has this ratio at 1.28x single-threaded on 33,890
files against 1.58x here on 3,889 with a thin-LTO build. Two populations and
two builds; the direction agrees and the magnitudes are not comparable.

## Where a client compile's time sits, and what the residual is not (2026-09-03 00:00)

3889-file slice, `enable_sourcemap: true` (the shipping default), thin-LTO build
so absolute ms are not comparable to a `release` run — the shares are.
Phase 1 parse 2.9%, phase 2 analyze 28.0%, phase 3 transform 69.1%. Inside
phase 3:

| bucket | ms | % of compile | % of phase 3 |
|---|---:|---:|---:|
| Pre-frag setup (**residual**) | 45.15 | 15.7% | 22.7% |
| Script-text xform | 44.89 | 15.6% | 22.6% |
| Template fragment | 41.35 | 14.4% | 20.8% |
| JS codegen | 35.56 | 12.4% | 17.9% |
| Assembly (post-frag) | 17.35 | 6.0% | 8.7% |
| CSS render | 10.89 | 3.8% | 5.5% |
| visit_program | 3.44 | 1.2% | 1.7% |

The first two differ by 0.6% and this tool's own run-to-run spread is 5.6% on
the total (measured, above), so **they are tied, not ranked** — do not quote the
residual as "the largest bucket".

**The four calls the residual was guessed to contain are not in it.** With the
plumbing validated by a positive control that reproduced `codegen` exactly to
two decimals, `strip_dead_comments_from_program` reads 0.45 ms,
`attach_import_origins` 1.57, `instance_has_top_level_multi_declarator` 1.39 and
`compute_blocker_primary_names` 0.00 — **3.41 ms of a 67.54 ms residual on that
run, 5%**. Four candidates eliminated; 95% of the residual is still unnamed, and
naming it needs region brackets rather than more guesses at call sites.

Two things the run also showed about the instrument. The printed
`still unnamed` line was itself wrong, because it subtracted the control — a
quantity outside the residual — as though it were attributed to it. And the
built-in double-count guard did not fire, because 57.10 < 67.54: it happened to
fit. **A guard that trips only on overflow is silent on a quantity that is
merely in the wrong bucket.**

Sizing: the residual is 15.7% of compile, so removing all of it is 1.19x, and
client needs 1.30x to reach 20x from 15.34x. Necessary, not sufficient — the
same shape as the single-thread/scaling decomposition above.

**And "Pre-frag setup" is not merely a guessed label, it is a demonstrably wrong
one.** `transform_client` begins at `client/mod.rs:506` and `visit_program` is
called at 554; the ~10 statements between them build `initial_node`,
`transform_options`, a `ComponentClientTransformState` and a `ComponentContext`.
That region cannot hold 15.7% of a compile, so the residual is not in front of
the fragment at all — it is in the gaps *between* the later timers. Those gaps,
with the lines that bound them, are:

| gap | between | bounded by |
|---|---|---|
| A | 556 – 637 | after `visit_program`, before the dead-comment strip |
| B | 644 – 731 | before `attach_import_origins` |
| C | 760 – 831 | after `record_script_text`, before `compute_blocker_primary_names` |
| D | 842 – 853 | before the fragment timer |
| E | 855 – 863 | between fragment and assembly |
| F | after 2855 | after the last `record_codegen` |

Anything phase 3 does outside `transform_client` (CSS render is separately
timed; the rest is not) also lands here. The next instrumentation should bracket
these six regions rather than name more call sites — the call-site guess has now
been tried and returned 5%.


## compile_profile accepted `--target server` and profiled the client (2026-09-02 23:50)

A client-vs-server bucket comparison came back with every share within 0.2
percentage points and totals 287.46 vs 272.30 ms — a 1.056x gap where the
published report has client 1.28x slower single-threaded. **Two independent
derivations of one quantity disagreeing is evidence about method**, and the
method was the fault: `compile_profile` never parsed `--target`. It hardcoded
`GenerateMode::Client` at both construction sites and reads its other flags
through six scattered `std::env::args()` predicates rather than a parser, so an
unrecognised flag is not an error — it is nothing. Both arms were the client.

The 1.056x is therefore a **run-to-run noise estimate for this tool** (5.6% on
the total, under 0.2pp on every share), which is worth keeping, and nothing at
all about client versus server.

**`perf_bench`, in the same directory, ends its argument loop with
`other => panic!("unknown arg {other}")`.** One instrument rejects what it does
not understand and its sibling ignores it, and the permissive one is the one
that produced a false comparison. The rule this repo already states — identify
an arm by a discriminating probe on its **output**, never by the label or the
flag you passed it — is usually written about mislabelled binaries; this is the
same failure one level down, where the flag was real, the binary was right, and
the *tool* discarded the distinction. A flag is a label.

`--target` is now parsed, and an unknown value panics instead of defaulting,
because a silently-defaulted arm is exactly what made the reading unreadable.

## What 20x on the client actually requires (2026-09-02 23:30)

Derived from the published report alone -- no measurement -- because the report
carries `medianMs` for all three arms and the single/multi pair is a parallel
efficiency:

| surface | official | rs-single | rs-multi | parallel eff. | single x | multi x |
|---|---:|---:|---:|---:|---:|---:|
| client | 39342 | 12114 | 4086 | 2.97 | 3.25 | 9.63 |
| server | 35071 | 9492 | 1790 | **5.30** | 3.69 | 19.59 |
| client-dev | 40463 | 13308 | 2914 | **4.57** | 3.04 | 13.89 |
| server-dev | 36723 | 9948 | 1838 | **5.41** | 3.69 | 19.98 |

Read the client row's 2.97 as contaminated (see the section below) and use the
dev pair for the parallel comparison. Two deficits separate client from server,
and they are independent:

1. **Single-threaded, client is 1.28x slower than server on the same corpus**
   (12114 vs 9492 ms) — but **1.28x overstates the deficit**, because official
   is also slower on the client (39342 vs 35071 = 1.122x). Normalising that out
   leaves **1.138x**, confirmed two ways: the ratio of ratios
   (1.276 / 1.122) and the ratio of single-thread speedups (3.695 / 3.248) agree
   to three digits. It is structural, not noise: `single x` is 3.69 on *both*
   server surfaces and 3.04-3.25 on *both* client surfaces.
2. **Client parallelizes worse** -- 4.57x against server's 5.41x on the clean
   dev pair.

**Neither one alone reaches 20x, and that is arithmetic rather than opinion.**
Client needs multi <= 1967 ms:

| change | client multi | speedup |
|---|---:|---:|
| give client server's parallel efficiency only | 2239 ms | 17.57x |
| give client server's single-thread time only | 3201 ms | 12.29x |
| **both** | 1754 ms | **22.43x** |

The sharpest form: at today's client single-thread time, 20x needs a parallel
efficiency of **6.16x**, and the best any surface here achieves is 5.41x. So a
scaling fix alone is not merely insufficient, it would have to beat the server
arm to work. **The client target requires composing a single-thread win with a
scaling win** -- which is the same "candidates compose" conclusion reached for
the fold candidates, arrived at from the other direction.

This also says where NOT to look: server and server-dev are at 19.59x and 19.98x
with 5.3-5.4x scaling and 3.69x single-thread, i.e. both server surfaces are
essentially done, and effort spent there cannot move the goal.

## The published client run was still improving when it ended (2026-09-02 20:00)

The interleaved instrument stores `rawMs`, and because the arms are paired the
per-round ratio `official[i] / multi[i]` is a legitimate quantity. On the
published report:

| surface | per-round ratio, rounds 1-5 | median | published | rounds increasing |
|---|---|---:|---:|---:|
| client | 9.56, 10.34, 10.69, 11.51, **15.34** | 10.69 | 9.63 | **10/10** |
| server | 20.09, 20.80, 18.46, 18.80, 19.50 | 19.50 | 19.59 | 4/10 |
| client-dev | 14.55, 13.86, 12.47, 12.88, 14.31 | 13.86 | 13.89 | 4/10 |
| server-dev | 20.83, 19.57, 19.75, 17.83, 21.00 | 19.75 | 19.98 | 5/10 |

Three surfaces wander around their median at chance (4-5 of 10 concordant
pairs); client rises monotonically and ends 1.60x above where it started. So
**the published 9.63x is a median over a distribution that had not settled**,
and the last round of the same run reads 15.34x. The three trendless surfaces
are the control that makes that readable at all.

**A mechanism was proposed for it and the artifact refuted it within ten
minutes.** `jsArm` compiles `file.source` — the corpus preloaded into the Node
heap — while `rustArm` passes a *file list* the Rust binary reads from disk, so
only the rsvelte arms pay page-cache cost, and client is the first surface
measured. That predicts the first surface's rsvelte arms trend faster in
**every** report. The report is versioned, so the prediction is testable
without measuring anything: across the six previous revisions the first
surface's `rsvelte-single` scores 7/10, 4/10, 12/55, 1/10 and 5/10 — no
structure at all. The asymmetry is real and worth keeping in the provenance
block, but it does not produce this.

**And the significance does not survive its own multiple comparisons.** A
perfectly monotone 5-sample arm has probability 2/120 under exchangeability;
across all six reports there are 72 arm-runs and **3** are perfectly monotone
(client/single 10/10 here, client-dev/single 0/10 and server-dev/official
10/10 elsewhere) against 1.2 expected. Picking the extreme of the 12 arm-runs
in the current report and quoting its p-value is the error the count exposes.
What stands is the weaker, sufficient claim: the client run's per-round ratio
trends where the other three do not, and a number drawn from it is not a
steady-state number. What caused it is unresolved — the transient contention
already recorded for that window is *consistent* with it but was established
from process evidence, and this trend is not independent confirmation of it.

**Reading order matters here.** The mechanism was attractive because it
explained a number this session wanted explained, and it was refuted by a test
that cost one `git show` loop. When an artifact is versioned, an out-of-sample
test of a proposed mechanism is nearly free — and it is worth the most exactly
when the mechanism fits.

## 20x is met on the slice (2026-09-02 10:11)

Merged tree `b86c8e26e` (three perf branches + a peer's Tier 1 + this session's
VLQ change), 3000-file slice, **paired** protocol — official and rsvelte run
back to back inside each round and the ratio is formed inside the round, so it
cannot divide two numbers taken under different load:

| target | median | mean | range | rounds >= 20x |
|---|---:|---:|---|---:|
| client | **22.64x** | 22.00 | 15.99-23.93 | 14/16 |
| server | **25.61x** | 24.55 | 19.50-27.14 | 14/16 |

Published report for comparison: client 5.14x, server 5.06x.

**Pairing is what made this measurable.** The same tree read 16.3x-20.3x an
hour earlier, and that spread was not noise — it was drift: official ran once
and rsvelte ran minutes later, so the ratio divided two numbers taken under
different load. Alternating them inside a round collapsed the spread and the
median moved by more than either arm's own variation. When a ratio is the
result, pair the arms in time; ABBA across arms does not cover the case where
the *comparison target* is measured separately.

Two caveats stand. This is the 3000-file slice, not the 33,890 the published
report compiles — and the evidence that the slice reproduces the report is
itself from `e9fe42c04`, an older tree, which is the same "measured somewhere
else" hazard this document keeps recording. And the box was not idle: load
3.9-4.5, free memory 12-14%, a 22.6 GB resident `llama-server` throughout.

**This figure and the full-corpus one differ by two variables, and the
compiler is not one of them.** `git merge-base --is-ancestor b86c8e26e HEAD`
returns true, and across those 36 commits exactly **one file under `crates/`
differs** — `3_transform/js_ast/codegen.rs`, from a refactor that replaces an
`assert` with a `check`. So the obvious explanation for a gap between the two
numbers, that they are different compilers, is ruled out rather than merely
unaddressed. What differs instead is the **population** (3000-file slice vs
33,890) and the **instrument**: six of the seven non-docs commits in the gap
are report-side, and one of them (`973cdc558`) rewrites
`run-performance.mjs` to pair the arms in time. The 22.64x was taken with
neither version — it used an ad-hoc pairing protocol described only in a commit
message, so it is a *third* instrument. Quote the two together, never as a pair
to choose between: a slice figure and a whole-corpus figure disagreeing is what
two populations and two instruments look like, not evidence that one is wrong.

**Writing that paragraph as "the variable is population alone" would have
contradicted this session's own largest finding.** The instrument is what moved
the client number from 9.63x to an estimated 15.6-17.7x — more than any
compiler change measured here — so a framing that drops it from the list of
variables is not a simplification, it is the specific error this document spent
the day documenting. The first draft made exactly that error, and cited a perf
commit as evidence of a compiler difference; `10d72ac22` is an **ancestor** of
`b86c8e26e`, i.e. already inside the tree that produced 22.64x. The reasoning
and the conclusion were right and only the example was wrong — which is the
dangerous shape, because an example is what a reader remembers, and **a correct
conclusion is exactly the condition under which its example does not get
checked.**

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

## The report measured the three arms in three different windows (2026-09-02)

`scripts/reports/run-performance.mjs` took every sample of `official`, then every
sample of `rsvelte-single`, then every sample of `rsvelte-multi`. On this corpus
those windows differ by more than an order of magnitude in **length**: official
is ~40 s a sample and rsvelte-multi ~2 s, so official's five samples spanned
~4 minutes and multi's spanned ~10 seconds. A load burst that covers the short
window and averages out over the long one moves the ratio. `interleave` now takes
one sample of each arm per round, alternating the order.

**The change is worth single digits, not the 45% first claimed.** Re-measured on
the same tree, corpus and binaries, on the three surfaces where the `official`
and `rsvelte-single` arms reproduce the sequential run (0.2-3%, which is what
makes a moved `multi` attributable at all):

| surface | sequential | interleaved |
|---|---|---|
| server | 18.83x | 19.59x |
| client-dev | 13.25x | 13.89x |
| server-dev | 17.57x | 19.98x |

The client surface of that run is disqualified: all three of its arms decline
together across rounds (first-two/last-two 1.099, 1.103, 1.448 against 0.95-1.05
everywhere else) and its official cv is 9.08% against 0.22-1.20%. The cause was
in part **the author of the run**, who spent 14:44-14:50 inside his own locked
window running `cargo metadata`, a `ps` polling loop and process probes — while
building the detector meant to certify the window as clean.

Four things this cost, all worth more than the numbers:

**A ratio needs its arms paired in time, and "back to back" is not paired.** The
arms have different *durations*, so consecutive blocks sample different amounts
of whatever else the box is doing. Alternating the order within a round matters
as much as interleaving.

**Pairing reduces bias in a ratio; it does not reduce an arm's variance — and a
cv table is therefore not evidence for it.** The sequential run's cv profile
(official 0.51%, single 0.63%, multi 8.07%, the same shape on all four surfaces)
was cited here as the fingerprint of block sampling. It is equally predicted by
a multi sample being ~2 s where an official sample is ~40 s, which no scheduling
change can alter. Measured: pairing moved client multi cv from 8.07% to
**20.53%**. The fingerprint argument is withdrawn.

**A probe harness is not the instrument.** The 20.71x / 22.66x figures first
published here came from a standalone script differing from the report on four
axes at once — warmup, process boundary, pairing and box load — and were quoted
for an afternoon as though they were the result. The controlled instrument says
+4% to +14%. Build the comparison inside the thing you intend to ship.

**The instrument still carries two unmeasured assumptions.** Its Rust arm warms
per sample (a fresh process cannot inherit warmth) while its JS arm warms once
before all rounds, which the sequential harness did not do; the direction is
conservative and the magnitude unknown. Restoring symmetry is possible from the
JS side — move `jsArm.warm()` to just before each sample — and costs ~200 s per
surface. That is a price, not a constraint; it was described as a constraint
here, which is how a trade stops being looked for.

## "The goal was not met" is a claim, and it needs the same precision as "met" (2026-09-02)

The regenerated report reads client 9.63x, server 19.59x, client-dev 13.89x,
server-dev 19.98x, and it was reported as *no surface reaches 20x*. Two of those
four do not support that sentence. **The arm that decides the ratio drifts
within a run, and on server and server-dev the drift is larger than the
shortfall.**

`first2/last2` on the raw millisecond samples, per arm (>1 = the early samples
are slower):

| surface | official | single | multi |
|---|---|---|---|
| client | 1.099 | 1.103 | 1.448 |
| server | 1.023 | 1.045 | **0.958** |
| client-dev | 0.998 | 0.998 | **0.953** |
| server-dev | 0.989 | 1.000 | **0.946** |

On the three surfaces with no external disturbance, both single-threaded arms
are flat (0.989-1.045) while the multi arm gets ~5% **slower** over the run.
Only the multi arm loads all ten cores, so a thermal cause is the obvious
candidate; it is consistent with, not proven by, the earlier ablation (a
one-core 20 s run drifted 1.020, a ten-thread 11 s run 1.36).

Carrying that drift into the ratio, `median(official)` over the first two and
over the last two multi samples:

| surface | reported | from first2 | from last2 | band | 20x inside |
|---|---|---|---|---|---|
| client | 9.63x | 9.13x | 13.22x | 9.13-13.22x | no |
| server | 19.59x | 20.05x | 19.21x | 19.21-20.05x | **yes** |
| client-dev | 13.89x | 14.20x | 13.53x | 13.53-14.20x | no |
| server-dev | 19.98x | 20.26x | 19.16x | 19.16-20.26x | **yes** |

So the defensible statement for server and server-dev is **19.2-20.3x, with the
deciding arm drifting ~5% inside a single run** — 20x sits in that band and
neither "met" nor "not met" is supported. client and client-dev are outside it
and *are* short. Reporting all four under one verdict let the two undecidable
surfaces inherit the two decided ones' answer.

The general form is the reason this is worth a section: a shortfall smaller than
the deciding arm's own within-run drift is not a measurement of a shortfall. It
was easy to miss because the conclusion ran the self-critical way — **a negative
verdict about your own work is still a claim, and the direction that flatters
nobody gets waved through the check that a flattering one would not.**

The drift itself is now the open question, and it is worth more than the 2%: if
it is thermal, every multi figure this file quotes is a function of how long the
run had been going, and the report takes its samples in a fixed order. Not
measured: whether the drift persists with a cool-down between rounds, and
whether it is thermal at all rather than page-cache or allocator growth.

## The multi arm's drift has a directly-observed cause, and it is not the compiler (2026-09-02)

The ~5% within-run degradation of the multi arm — flat on both single-threaded
arms — was being treated as a thermal candidate. It does not need one. Sampled
every 2 s for two minutes on the box every measurement today was taken on:

| process | median %CPU | min | max | cv |
|---|---|---|---|---|
| `mediaanalysisd` | 87.4 | 68.5 | 101.1 | 8.5% |
| `mds_stores` | 19.1 | 5.9 | 85.7 | 58.3% |
| next-highest non-ours | 10.5 | 5.4 | 80.4 | 88.1% |

In core-equivalents on a 10-core M2 Pro that is **1.01 to 1.92 cores, median
1.23, cv 16.5%** — a 9-percentage-point swing in available capacity. `mediaanalysisd`
alone has held ~1 core since **09:08**, i.e. through the published report, through
the regenerated one, and through every probe quoted here.

The arms are affected exactly as their core demand predicts. The multi arm wants
all ten and absorbs the whole swing; the single arms want one, and 8-9 are free
throughout. The report's own dispersion matches without any further mechanism:
**multi cv 20.5%, single 0.63%, official 0.51%.**

**Two corrections to the paragraph above, both from a second measurement.** First,
`ps %cpu` is a decayed average, not an instantaneous rate: read as CPU-seconds
consumed over the same 3 s windows, `mediaanalysisd`'s cv is **2.3%**, not the 8.5%
in the table, and two `%cpu` reads of 100.5 and 76.1 covered windows whose true
values were 89.7 and 87.4. Every cv here is inflated roughly 3.7x, and the
inflation runs toward making the contention hypothesis look stronger. Use
`(ps -o time=) delta / elapsed`, not `%cpu`, whenever contention is a *covariate* —
measuring a covariate with error attenuates its regression coefficient, which
manufactures exactly the "residual the contention cannot explain" that a thermal
claim would feed on. The core-equivalent conclusion survives: by CPU-second deltas
third-party load is 1.04-1.59 cores (median 1.49), so a 10-thread arm sees ~8.4
cores. **~15% of the box belongs to someone else** either way.

**Third, and measured after the two above: contention does not explain the drift at all,
and the sign is wrong for it.** A clean 20-point run — positive control passed (a planted
`rustc` read 0.98 cores), all 20 points `build = 0.00`, no peer build present — splits into
two phases. In the ramp phase, `wall_min` rises 13.9% while `CPU_min` is flat (1.0226) *and
the measured third-party load falls from 0.79 to 0.69 cores*: `r(other, wall) = -0.376`, and
regressing wall on contention leaves a residual ramp that is **larger** (+81 ms), not
smaller. The second phase does correlate the expected way (`r = +0.533`). So the earlier
paragraph's "contention is a strong candidate for the variance" holds for one phase and is
**refuted for the phase where the front/back asymmetry actually lives**. All three named
hypotheses are now eliminated there — a peer's build (positive control), clock/thermal (CPU
flat), and third-party contention (wrong sign) — leaving `wall` up with neither CPU nor
competitor CPU up, i.e. **effective parallelism falling for an unidentified reason**. The
honest state is *unexplained*, with three candidates struck off rather than one confirmed.

Read the magnitude as a range: `CPU_min`/`wall_min` are minima over different runs, so their
ratio implies a 10.2% parallelism loss while the binary's own printed `parallelism` (a
median) says 2.7%. **13.9% is the upper bound, 2.7% the lower**, and the two differ by 3x
because minima were recorded where medians were printed on the same line.

Second, **the steady-contention argument explains the variance and NOT the drift.** A steady 1.5-core
competitor produces round-to-round dispersion; it produces no monotone component,
and the monotone front/back asymmetry is what was reported. Two minutes of
sampling says nothing about a trend across a 20-minute run. So the honest split is:
contention is **demonstrated** as a steady ~15% handicap and as a strong candidate
for the between-round variance, while **the within-run monotone drift has no
measured cause at all** — neither contention nor thermal. Saying "a thermal
explanation is not required" overstated it; what is true is that contention is
measurable and thermal is not (`pmset -g therm` needs sudo), so the measurable one
gets tested first. And **the deciding arm's precision is set by a third-party process,
not by rsvelte**: no amount of care in the harness recovers a number whose arm is
losing 10-19% of the machine unpredictably. That is the real reason server's 19.59x
and server-dev's 19.98x cannot be resolved against 20x.

The practical rule: **record the box's non-ours CPU alongside each sample.** It costs
one `ps` per sample, it is the difference between a drift with a cause and a drift
with a story, and it was available all day.

## Two claims about parallel scaling, made and withdrawn within half an hour (2026-09-02)

Both came from decomposing the report into `single-thread gain x parallel
scaling`, both looked large, and both were killed by the next measurement. The
decomposition itself stands and is worth keeping:

| surface | single-thread | parallel | total |
|---|---|---|---|
| client | 3.25x | 2.97x | 9.63x |
| server | 3.69x | 5.30x | 19.59x |
| client-dev | 3.04x | 4.57x | 13.89x |
| server-dev | 3.69x | 5.41x | 19.98x |

**The single-thread gain is nearly uniform (3.04-3.69x) and the parallel factor
is not.** That much is real, and it says the remaining distance to 20x is a
parallel-efficiency question rather than a single-thread one.

**Withdrawn claim 1: "client scales worse than server."** A direct `perf_bench
--threads` sweep on the same box measured client and server efficiency as
near-identical at every thread count (1/2/4/6/8/10 -> client 1.00, .785, .887,
.880, .741, .546; server 1.00, .805, .910, .917, .771, .480) — with client
*ahead* at ten threads, 5.46x against 4.80x. The report's client row is the
surface whose window was self-contaminated, so its 2.97x is an artifact and the
"client scales worse" reading was built on it. The 4.57x on the clean client-dev
row is still below the server pair and is the only part that survives; one row is
not a trend.

**Withdrawn claim 2: "8 threads beats 10."** A first sweep with two reps per
point, read as best-of-two, showed 8 threads ahead for both targets (client 81.2
vs 88.1 ms, server 64.6 vs 83.1) and it looked mechanistically clean — 6P+4E, an
E-core worker at 0.22-0.24x, plus ~1.5 cores of third-party load leaving ~8.4
available. Six rounds with 6/8/10 paired *inside* each round and the order
rotated: client median 8-vs-10 = 1.021x with per-round ratios 0.712-1.190,
server = 0.962x (i.e. ten ahead) with ratios 0.815-1.509, and ten threads takes
the most per-round wins on both. **No effect.** The best-of-two reading of two
samples is what produced it; the ten-thread points in the second run reached 78.5
and 67.0 ms, better than anything the first run saw.

The shipping default is rayon's own pool, and its doc comment records 6-vs-10
being measured. Eight was never in that comparison and now has been: it is not
better. What generalizes is narrower than either claim — **a decomposition can
be sound while the row you build on is contaminated, and `min` over two samples
is not a measurement.** Both were caught the same way, by taking the obvious
follow-up measurement before reporting the lead as a result.

## One micro-optimization, opposite signs on the two targets (2026-09-02)

`CodeBytes::next` called `skip_opaque` for every byte of every script, and that
function answers `None` for all but four opener bytes (`` ` ``, `'`, `"`, `/`).
Guarding the call is the obvious win. Measured as two separately-built binaries
(distinct sha256), ABBA-paired inside each of 8 rounds, on the **single-thread**
arm because that arm's cv is 0.63% and it is nearly immune to the ~15% of the box
that belongs to other processes:

| target | before/after CPU_min | rounds the guard wins | range |
|---|---|---|---|
| server | **1.0241** (+2.41%) | 8/8 | 1.021-1.065 |
| client | **0.9838** (-1.62%) | 1/8 | 0.950-1.002 |

Output is byte-identical — the `sink` checksum over every compiled file matches
exactly on both targets (client 23372018, server 31488179, 2887 files) — so this
is purely a cost question. Both directions are consistent rather than noisy:
8/8 one way, 7/8 the other.

**A guard that skips a call is not free, and where the scan is a smaller share
the guard's own cost dominates.** That first version used a `[bool; 256]` table,
which is a memory load in a loop that runs once per script byte. Replacing it
with a four-way `matches!` — four immediate compares, no load — flips the sign,
measured the same way against the same `before` binary (three distinct sha256s,
so neither arm can be the other):

| target | before/after CPU_min | rounds won | range |
|---|---|---|---|
| server | **1.0191** (+1.91%) | 6/8 | 0.998-1.026 |
| client | **1.0065** (+0.65%) | 8/8 | 1.0046-1.0075 |

Output stays byte-identical on both. The client row is the interesting one: a
0.65% median with an 8/8 sweep and a total spread of 0.3% is small but not noise,
and it is the surface that needs the help. The table lived there so a test could
assert the guard and `skip_opaque` agree over all 256 byte values; that test is
worth keeping, so the table moved *into* the test as an independent statement of
the set — checking `matches!` against the same `matches!` would assert nothing.

The reusable part is the shape of the result, not the fix. **The same change was
+2.41% and -1.62% depending only on which target ran**, and a single-target
measurement would have shipped it or binned it with equal confidence. Byte
scanning is 14.73% of a server compile and 11.53% of a client one; a saving
proportional to that share, against a cost proportional to source length, changes
sign somewhere between them. Measure a shared-path change on both.

## Sizing the remaining gap: two arithmetic errors to avoid (2026-09-02)

**Do not write `1/(1-0.403) = 1.68x` for "if the whole alloc+hash+memcpy bucket
vanished".** That is the conversion this repo already retracts — a share of a
bucket cannot become a share of total time using a factor derived from the same
profile share being apportioned. The 40.3% is a share of *non-kernel CPU*, not of
`compile()`. Two things make the mistake conservative here, so a fold decision
survives it: the denominator is larger than `compile()`, and no representation
change takes allocation to zero. Write it as **< 1.68x**, an upper bound. With an
equals sign the same number is available to someone arguing the other way.

**And candidates compose, so "no single candidate reaches the target" is not a
reason to close a direction.** Non-overlapping client shares, as measured:
byte scanning unreachable under an AST pipeline 9.8%, JSON key lookup ≤5%, CSS
render 3.6% — roughly 18%, i.e. about 1.22x, and the overlap between them is
**not measured**, so even that is optimistic. The composition is what a fold
decision has to clear: at a required 1.39x these together plus a representation
change is a live possibility, and at a required 2.08x it is not. Which of those
two numbers is current is the open question, and it is why the clean client
re-measurement gates this work rather than the sizing does.

## Where the client's remaining time is, after three candidates were ruled out (2026-09-02)

Three buckets were measured to closure on the merged tree, all through `compile()`
(not `transform_component` — see below), 3000-file slice, symbols aggregated from
samply with two-sided controls:

| candidate | share of `compile()` | verdict |
|---|---|---|
| CSS render (`record_css_render`'s subtree) | 3.61% client / 3.86% server | not a lever |
| `serde_json` JSON-object key lookup | 2.23%–7.63% client, 1.14%–9.73% server | not a lever |
| byte scanning (`str::pattern`, `memmem`, `js_scan`) | **11.53% client / 14.73% server** | the lever |

**CSS looked like 16% and was not.** `compile_profile.rs` reported `CSS render` at
16.1%, and it reproduces exactly (15.97%) — as *CSS-bearing files only* over a
*transform-only denominator*. `compile_profile` calls `analyze_component` /
`transform_component` directly, so phase 1 and the finalize step are missing from
its denominator; and `record_css_render` only fires when `analysis.css.has_css`,
which is 16.9% of the slice and 17.9% of the corpus. The two effects multiply to
4.4x. Over `compile()` and the whole population it is 3.61%. **Two denominators
in series is enough to turn 3.6% into 16%, and neither one is wrong on its own.**

**The JSON-key figure had to be split by hasher, not by name.** A first pass put
it at 9.21% / 9.36% by matching hashing symbols; that swept in rsvelte's own
`FxHashMap` traffic. `serde_json`'s `IndexMap` uses std's `RandomState`
(SipHash) and rsvelte's own maps use `FxHash`, which is the clean discriminator:
the unambiguous key-lookup share is 2.23% / 1.14%, and 7.63% / 9.73% is the upper
bound with *all* SipHash and *all* `memcmp` charged to it. Inside the CSS walk it
really is 58.7% — 546 `.get()` sites over 17 distinct keys — but CSS is 17 of the
96 distinct keys in `phases/`, and a subtree's density is not the tree's.

What is left, for whoever picks this up: `alloc + memcpy` 15.99% / 15.87%
(diffuse, and the same conclusion #2622's section already reached — the target is
the representation, not a site), `oxc` parse/lex 14.61% / 10.24%, and the byte
scanning above. Sourcemap work is 0.93% on the client and 7.14% on the server.
UNMATCHED was 57.10% / 52.72%, so no bucket here is inflated by absorbing
everything it did not name.
