# Styling: all 453 new units

The measured workload covers all 453 formerly unparsed CSS units: 4,962,867 source bytes.
Every worker checks exact CSS against Svelte 5.57.1 before measuring.
The full CSS corpus has 2,161 matches, no parse failures, and no differences.
See [population.json](population.json), [css.tsv](css.tsv), and [positive-control.json](positive-control.json).

## Changes

Static classes select candidate elements before the existing selector matcher runs.
Dynamic classes and spreads stay in the candidate set. Other selectors visit the tree directly.
Only classes used as selector anchors get buckets. Each bucket holds two `u32` offsets;
all element identifiers share one contiguous buffer. Class names borrow existing text.
Selector traversal uses a callback, and dynamic flags reuse their existing side table.
Trees stay immutable. Client and server use the same analysis.

A new oracle probe also found wrong scoping order in `:is(.a) .b`.
Emission now decides the outer selector's specificity before visiting pseudo-class arguments.
Tests cover all, none, and some matching elements, dynamic values, spreads,
directives, escaped names, globals, and nesting.

## CPU cycles and instructions

Actual process counters come from `proc_pid_rusage(RUSAGE_INFO_V4)` between stdin gates.
One worker processes files in order. Reading inputs and warmup are outside the gates;
measured work includes destruction. There are 20 warmup rounds and four measured
trials per arm. The before/after sequence is ABBA twice, with 20 rounds per trial.
Zero-round controls advance counters; measured work exceeds those controls.

| Median per input | Before | After | Reduction |
|---|---:|---:|---:|
| Total CSS pipeline: cycles | 682,962 | 596,369 | 12.7% |
| Total CSS pipeline: instructions | 2,555,056 | 2,190,287 | 14.3% |
| Analysis: cycles | 251,922 | 183,056 | 27.3% |
| Analysis: instructions | 1,151,521 | 791,876 | 31.2% |

Total cycle ranges are 658,111–773,560 before and 573,526–653,832 after.
Analysis ranges are 250,407–254,906 before and 180,076–199,543 after.
See [cycles-before-after.json](cycles-before-after.json).
Frequency and affinity are not fixed, and other processes were active.
These results do not prove the fastest possible implementation.

The baseline phase run identifies parsing and analysis as large costs.
The analysis stack sample contains frequent class matching and nesting calls.
See [before phase counters](cycles-phases-before.json), [after phase counters](cycles-phases-after.json),
and the raw stack sample.
Phase workers keep prerequisites for all 453 inputs outside the gates.
Their cache state and lifetimes differ from the total pipeline; phase values are not additive.

The three-arm CSS run uses five rounds per trial in official/old/rewrite/rewrite/old/official
order twice. The official worker stays alive after one warmup; native workers warm
on each launch. All three arms check all 453 CSS outputs before measuring.

| Median per input | Official JS | Old Rust | Rewrite |
|---|---:|---:|---:|
| Cycles | 12,356,003 | 3,511,432 | 587,841 |
| Instructions | 43,397,427 | 12,325,760 | 2,193,301 |

See [cycles-three-arms.json](cycles-three-arms.json). This workload parses,
builds semantic facts, scopes CSS, and emits CSS. It does not generate JavaScript.
Official and old output include CSS source maps; the rewrite omits them.
These are CSS-workload comparisons, not full-compiler speed ratios.
The first official run hit its warmup timeout. The persistent-worker retry completed;
its failed attempt is preserved in the raw archive.


## Memory

A separate binary counts requested allocation bytes and peak live heap growth.
It uses the same workload, with one measured round after warmup.
Inputs and prepared phase prerequisites are excluded from these counts.

| Total CSS pipeline, 453 inputs | Before | After |
|---|---:|---:|
| Allocation calls | 288,875 | 288,477 |
| Requested bytes | 46,188,388 | 45,465,926 |
| Largest live heap growth, bytes | 355,401 | 357,209 |

Requested bytes fall 1.6%. The largest per-file transient heap rises 1,808 bytes (0.5%).
This is the cost of the faster candidate index. It is not a peak-memory improvement.
See [allocations-before.json](allocations-before.json) and [allocations-after.json](allocations-after.json).
A sorted bucket experiment saves 1,624 peak bytes against the chosen index but
raises analysis cycles 8.3% in its paired run; it was rejected.
See [cycles-sorted-index.json](cycles-sorted-index.json). The intermediate source snapshot
was not retained; its binary hashes and raw counters are retained.

Compiler layout output measures an 88-byte candidate header, an 8-byte bucket
with no padding, and 4-byte element identifiers. Borrowed-name/bucket rows use
24 bytes: a 16-byte name reference and an 8-byte range.
Analysis remains 136 bytes; the matcher element remains 56 bytes.
See [layout.txt](layout.txt).
Warm total-pipeline memory maps show physical footprints of `11.8M` and `11.7M`, as displayed by `vmmap`.
They include all loaded source and expectation buffers, libraries, and allocator caches.
These single rounded snapshots do not establish a precise RSS reduction.
See [before map](before-vmmap-map.txt) and [after map](after-vmmap-map.txt).
Cache misses are **UNMEASURED**: Instruments requires a full Xcode installation here.

## Correctness and provenance

The fresh 16-component and common 18-component runs match official JavaScript ASTs
and exact CSS for both targets: 68 outputs each.
See [compile-ast.json](compile-ast.json) and [common-compile-ast.json](common-compile-ast.json).
Workspace tests, strict Clippy, formatting, and structure checks pass; see [checks.json](checks.json).
This establishes the measured CSS coverage, not full JavaScript parity over the wider corpus.

Hardware is Apple M1 Pro. Rust is 1.98.1; Node is 26.7.0.
The rewrite HEAD is `d3fe0394b0b11ab70829fad9a544b2b03ac81618` with dirty sources.
The old baseline is `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`.
All 1,803 copied tracked old Rust files match that tree except the measurement hook.
Source hashes, archive hashes, driver hashes, and binary hashes are in [sources.json](sources.json).
[sources-before.zip](sources-before.zip) and [sources-after.zip](sources-after.zip)
freeze the measured rewrite sources. Drivers and [raw logs](raw.zip) are retained.
Concurrent CLI, browser, and JS lowering edits are outside this frozen CSS workload.

## Reproduce

Use macOS for hardware process counters. Run from the repository root.
Extract each source archive into a separate directory. Copy `drivers/corpus_cycles.rs`
and `drivers/corpus_alloc.rs` into each snapshot's Svelte compile examples directory,
then build the release examples in separate Cargo target directories.
The old snapshot needs `drivers/old-css-hook.rs` appended to its compiler module and
`drivers/old-css.rs` installed as a core example. Product sources need no measurement hooks.

```sh
python3 docs/measurements/styling/corpus-453/drivers/manifest.py . > /tmp/styling-453.tsv
python3 docs/measurements/styling/corpus-453/drivers/counters.py /tmp/styling-453.tsv /tmp/styling-abba --before <before-binary> --after <after-binary> --phases total,analyze --rounds 20
mise exec -- python3 docs/measurements/styling/corpus-453/drivers/three-arms.py /tmp/styling-453.tsv /tmp/styling-three --official docs/measurements/styling/corpus-453/drivers/official-css.mjs --old <old-binary> --rewrite <after-binary> --phases total --rounds 5
```
