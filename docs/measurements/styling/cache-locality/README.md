# Styling cache-locality experiments

All four candidates were rejected. The original 56-byte element remains. Smaller
handles did not improve both total CPU cost and analysis CPU cost.

## CPU results

Each row compares its candidate with the same frozen baseline in its own run.
Percentages use the median per input. Positive means more work.

| Candidate | Total cycles | Analysis cycles | Analysis instructions |
|---|---:|---:|---:|
| Shared context reference; 16-byte element | -4.39% | +4.84% | +0.82% |
| Identifier plus context reference; 4-byte element | -0.84% | +0.95% | +1.00% |
| Identifier plus context value; 4-byte element | +1.09% | -3.38% | +0.66% |
| Context value plus callback pair; 4-byte element | +1.72% | -1.64% | +0.42% |

Cycle ranges overlap. These are observations, not proof of a cycle improvement.
Do not compare absolute cycle counts across runs. The shared machine had other
work, and neither core placement nor CPU frequency was controlled.

The population was 453 Svelte files, with 4,962,867 source bytes. Every worker
checked all 453 CSS outputs before measurement. Each arm had four trials in
ABBA order, 20 warmup rounds, and 20 measured rounds. Zero-round controls are
included. The process counter uses `proc_pid_rusage(RUSAGE_INFO_V4)` and stdin
gates. Destruction is included. Inputs are loaded outside the gates. Analysis
prerequisites for all inputs are resident before its gate; phase results are
not additive and do not have the same cache state as the total workload.

`taskpolicy -B` was requested for every final worker before warmup. This does
not prove performance-core placement. Initial timeout runs and a retry with
mixed process policies were discarded. Their raw files are retained.

## Memory and caches

Compiler type-layout output confirms the first candidate changed the element
from 56 to 16 bytes, with a separate 48-byte context. Later candidates reduced
the handle to a 4-byte identifier. The element is a temporary traversal value;
its size is not the size of a persistent node array. Moving fields into a
context does not remove the referenced trees or side tables.

Allocation measurements for the baseline and first candidate were identical:
288,477 calls, 45,465,926 allocated bytes, and 357,209 bytes of peak live growth
across the total workload. Other candidates' allocations are UNMEASURED.
Raw `vmmap` output records process regions and residency. It does not measure
cache residency.

This M1 Pro reports 128 KiB L1 data and 12 MiB L2 for the performance-core
level, 64 KiB L1 data and 4 MiB L2 for the efficiency-core level, and 128-byte
cache lines. Cache and TLB misses are **UNMEASURED**. The read-only thread
counter probe returned EPERM; its zero-filled buffer is not a zero-miss result.
No claim of fastest possible code or cache improvement follows from these data.

## Reproduction and checks

`sources.json` records HEAD, oracle version, and dirty source hashes.
The source archives keep the baseline, all four rejected candidates, and the
restored matcher with the concurrent module split. Performance of the restored
module split and equivalent formatting changes is UNMEASURED. Each cycle JSON includes
binary hashes, raw counter deltas, controls, and ranges. `raw.zip` contains
logs, memory maps, and worker output. `checks.json` records final validation.
The first candidate and the restored implementation each matched all 2,161
CSS oracle units. The restored implementation also matched JS syntax trees and
CSS for 68 client/server outputs from 34 authored components (`probes.zip`).
This is CSS
compatibility, not full JavaScript compiler compatibility. The shared-workspace
styling fixture run had 50 cases and zero harness problems, but 23 of its 26
official JavaScript cases differed. Limited CSS and semantic Clippy checks and
the structure check passed. Workspace Clippy and formatting checks failed in
concurrent files. The earlier workspace test run failed on a missing executable
in the shared target directory.

The previous [three-arm report](../corpus-453/README.md) compares official
Svelte, old rsvelte, and the rewrite on this population. That comparison is
historical; it is not a new three-arm run of these rejected candidates.

Commands and drivers are retained under `drivers/`. Supply the same manifest
and release binaries to `counters.py`, `allocations.py`, and `memory-map.py`.
`probe.py` records hardware cache sizes and the read-only counter probe.
