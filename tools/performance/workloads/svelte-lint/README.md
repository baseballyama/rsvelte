# Svelte lint workload

This package is separate from the workspace. It builds the production dependencies without test
tracing. `before` is the saved eager lint implementation on the same dependencies, and `after`
uses the production task. The `-button` modes select only `svelte/button-has-type`; the eager
reference still builds all its facts. Both modes must produce the same output digest before you
compare counters.

```sh
mise exec -- node tools/performance/workloads/svelte-lint/prepare.ts /tmp/lint-workload
cargo build --release --manifest-path tools/performance/workloads/svelte-lint/Cargo.toml
tools/performance/workloads/svelte-lint/target/release/lint-architecture-benchmark after-button /tmp/lint-workload/real.txt 500
cargo build --release --features allocations --manifest-path tools/performance/workloads/svelte-lint/Cargo.toml
```

Save the native binary before you build with `allocations`; hardware measurements use the
native binary. Allocation counts describe the last warmed round, without input loading and
registry construction. Uninstrumented counts are `null`. The summary measures the size of the
rule configuration. Type payload fields are `null`, because this syntax and scope workload does
not link the optional typed lint crate. Parsing, rule execution and report output all stay
inside the measured workload.

`real.txt` selects the original hand-written lint population from the compile inputs.
`synthetic.txt` holds a separate component heavy in attributes. Never combine its results with
real files without declaring both populations.

Use the cycle and cache backends in [the performance guide](../../README.md). Check `documents`,
`rounds`, `output_bytes` and the digest in workload summaries. Run forward/reverse pairs, and
hash the inputs, source files and binaries before and after. Cachegrind reports a model;
hardware cycles are a separate measurement.

For the third arms, use `oracle.ts` for ESLint and `old.rs` for the old rsvelte. To generate a
standalone Cargo package for the old rsvelte, pass a frozen old checkout to `prepare.ts`. Record
the full old commit and the oracle versions. As a positive control, both wrappers check that
they report a missing button type. Their report output differs, so their process totals give
context; they are not a speed ratio for the same output.

## Recorded results

The raw results were in `measurements.json`, which is not in the repository. It held the
populations, raw counters and hashes, and the ranges and allocation counts. They cover the
recorded implementation and a static dispatch experiment that the project did not adopt. The
counters belong to the saved binaries and source hashes, so they do not measure the final
workspace tree.

For 53 real files in the recorded snapshot:

| Configuration | Median CPU cycles          | Allocations per round | Requested bytes per round |
| ------------- | -------------------------- | --------------------- | ------------------------- |
| Default       | -2.58%, overlapping ranges | 2,462 → 2,451         | 283,001 → 282,179         |
| Button only   | -42.82%, separate ranges   | 2,398 → 701           | 271,317 → 90,935          |

The default result does not show a general speed improvement. For button only, the cache models show
59.72% and 45.88% fewer L1 data read misses in two cache layouts. The models simulate these misses;
they are not hardware counters. The raw results also held the other arms: the separate synthetic
population, the official JS run and the old `main` run.

Most of the saving comes from skipping HIR, scopes and parent tables for configurations that
need only syntax. The rules inspect attributes once, without a vector per element.
Configurations share storage, and report rule names stream directly to the writer. The recorded
condition facts used one byte per JS/TS node; the lint crate computes them only for a type-aware
rule. Alias resolution is iterative and visits each binding once. Trees keep their
existing immutable form.

The default rules still need scopes. Their hardware difference is small, and the cache model shows
more L1 misses for them. These results do not show a general cache improvement. The rule hot paths
walk irregular trees and bindings. UNMEASURED: SIMD optimization and hardware cache misses. The
change adds no structural scan of the raw source.
