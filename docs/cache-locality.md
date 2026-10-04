# Cache locality

The [measurement tools](../tools/performance/README.md) support every task and executable.
They keep cache simulation, hardware CPU counters, hardware cache counters and type
layout as separate measurements. CI runs defect controls and saves the type layout.

## Profile and change

The compiler's foreign-element and generated-name checks walked static string tables.
In the 64-byte model, their L1 data read misses fell from 5,591 to 21 and from 2,561 to
35 over three rounds after replacing the walks with constant string patterns.
Node payload sizes and allocation totals stay unchanged. This change removes reads of
table entries and their strings. It also changes the instruction footprint.

## Results

The base commit is `d3fe0394b0b11ab70829fad9a544b2b03ac81618`. Both arms use frozen
dirty trees. The two lookup implementations change, and one unrelated import list is
formatted. Concurrent work is excluded.
[Metadata](measurements/cache-locality/metadata.json) links source manifests, binaries,
raw counters, profiles, source archives and input hashes.

| Population | Files | Source bytes | Client/server outputs |
|---|---:|---:|---:|
| Special elements | 74 | 8,487 | 148 |
| Largest files with both targets matched in the earlier selected corpus | 8 | 28,639 | 16 |

Each cache sample runs three rounds. Each population/model has twelve process samples.
These are process totals, including startup and the first cold round. Reductions below
compare medians; a negative value means an increase.

| Model / population | L1 data read miss reduction | L1 data write miss reduction | L1 instruction miss reduction |
|---|---:|---:|---:|
| 64-byte / special elements | 16.64% | 8.11% | 0.69% |
| 64-byte / larger files | 2.64% | 0.55% | -1.50% |
| 128-byte / special elements | 5.30% | 2.02% | -1.14% |
| 128-byte / larger files | 5.66% | -3.59% | 0.19% |

Total L1 data misses fall in all four comparisons. Some instruction or write counts
increase. The 128-byte model uses the reported performance-core cache capacities, with
assumed associativities. Neither model reproduces the full M1 microarchitecture.

Actual CPU counters use release binaries without allocation instrumentation on an
Apple M1 Pro. Each population has 24 samples in ABBA order, 2,000 rounds per process.

| Population | CPU cycles per round before → after | Observed median reduction |
|---|---:|---:|
| Special elements | 4,124,020 → 4,034,557 | 2.17% |
| Larger files | 3,459,895 → 3,387,716 | 2.09% |

Cycle ranges overlap on this shared host; the reports retain every sample. Retired
instruction medians fall by 1.06% and 2.38%. These results do not establish a hardware
cache-miss reduction or a globally fastest implementation.

Separate metrics builds report identical allocations, allocated bytes and peak live
growth before and after: 14,259 / 791,437 / 133,630 for special elements and
12,750 / 1,114,982 / 126,545 for larger files. Peak RSS is `UNMEASURED`.

All 164 generated outputs match before/after byte for byte and official Svelte 5.57.1
as ASTs. A separate twenty-file cache experiment also records old Rust and official
Svelte; the official Valgrind arm uses `--jitless`. It does not measure normal JIT speed.

Linux hardware cache events are `UNMEASURED`: the VM reports no supported PMU events,
including with `CAP_PERFMON`. The collector preserves this result and returns nonzero.
macOS provides the measured hardware CPU cycles and instructions through `proc_pid_rusage`.
