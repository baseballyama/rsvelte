# Svelte lint workload

This package is separate from the workspace. It builds production dependencies
without test tracing. `before` is the saved eager lint implementation on the same
dependencies. `after` uses the production task. The `-button` modes select only
`svelte/button-has-type`; the eager reference still builds all its facts.
Both modes must produce the same output digest before comparing counters.

```sh
mise exec -- node tools/performance/workloads/svelte-lint/prepare.ts /tmp/lint-workload
cargo build --release --manifest-path tools/performance/workloads/svelte-lint/Cargo.toml
tools/performance/workloads/svelte-lint/target/release/lint-architecture-benchmark after-button /tmp/lint-workload/real.txt 500
cargo build --release --features allocations --manifest-path tools/performance/workloads/svelte-lint/Cargo.toml
```

Save the native binary before building with `allocations`. Hardware measurements
use the native binary. Allocation counts describe the last warmed round and
exclude input loading and registry construction. Uninstrumented counts are `null`.
The summary measures rule configuration size. Type payload fields are `null`
because this syntax/scope workload does not link the optional typed lint crate. Parsing, rule execution and report
emission all stay inside the measured workload.

`real.txt` selects the original hand-written lint population from compile inputs.
`synthetic.txt` contains a separate attribute-heavy component. Never combine its
results with real files without declaring both populations.

Use the cycle and cache backends in [the performance guide](../../README.md).
Check `documents`, `rounds`, `output_bytes` and the digest in workload summaries.
Run forward/reverse pairs. Hash inputs, source files and binaries before and after.
Cachegrind reports a model; hardware cycles are a separate measurement.

For the third arms, use `oracle.ts` for ESLint and `old.rs` for old rsvelte. Pass a
frozen old checkout to `prepare.ts` to generate its standalone Cargo package.
Record the full old commit and oracle versions. Both wrappers verify a missing
button type as a positive control. Their report serialization differs, so their
process totals are context, not an equivalent-output speed ratio.

## Recorded results

[measurements.json](measurements.json) retains the populations, raw counters,
hashes, ranges and allocation counts for the recorded implementation and the
static dispatch experiment that was not adopted. Counters refer to the saved
binaries and source hashes. Later source changes are listed separately; these
counters do not measure the final workspace tree.

For 53 real files in the recorded snapshot:

| Configuration | Median CPU cycles | Allocations per round | Requested bytes per round |
|---|---|---|---|
| Default | -2.58%, overlapping ranges | 2,462 → 2,451 | 283,001 → 282,179 |
| Button only | -42.82%, separate ranges | 2,398 → 701 | 271,317 → 90,935 |

The default result does not establish a general speed improvement. The button-only
cache models reduce L1 data read misses by 59.72% and 45.88% in two cache layouts.
These are simulated misses, not hardware counters. See the JSON for all arms,
including the separate synthetic population and the official JS and old main runs.

The main saving comes from skipping HIR, scopes and parent tables for syntax-only
configurations. Attributes are inspected once without a per-element vector.
Configurations share storage; report rule names stream directly to the writer.
The recorded condition facts used one byte per JS/TS node; this provider now
lives in the separate `lint_typed` crate. Alias resolution is iterative and
visits each binding once. Trees keep their existing immutable representation.

The default rules still need scopes. Their hardware difference is small, and the
cache model has higher L1 misses. There is no claim of a general cache improvement.
The rule hot paths traverse irregular trees and bindings. SIMD optimization and
hardware cache misses are UNMEASURED. No raw-source structural scan was added.
