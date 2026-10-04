# Expression precedence profile

The candidate reads node tags and operator flags for JS expression precedence,
instead of decoding a full `Kind` value. It uses the existing immutable tree columns
and operator definitions. The production compiler keeps its current implementation.

## Decision

The candidate is held. Instruction counts fell, but CPU cycles did not improve across
both measured populations. Cache models also show increases for special elements.
These measurements do not establish that the candidate is faster.

The base commit is `d3fe0394b0b11ab70829fad9a544b2b03ac81618`. The baseline is the
frozen candidate from [cache locality](cache-locality.md). Only the precedence function
changes in this experiment. Concurrent workspace changes are excluded.
[Metadata](measurements/cache-precedence/metadata.json) records source, binary,
input and tool identities. The source archives retain the candidate.

Each actual CPU sample runs 200 rounds. Each population has 24 samples in ABBA order,
with twelve samples per arm, on an Apple M1 Pro. Both arms use the same workload.

| Population | Files / outputs per round | Median cycles before → candidate | Cycle change | Retired instruction change |
|---|---:|---:|---:|---:|
| Special elements | 74 / 148 | 5,051,719 → 5,175,487 | +2.45% | -2.87% |
| Larger files | 8 / 16 | 3,809,883 → 3,771,766 | -1.00% | -1.30% |

Cycle ranges overlap on this shared host. The initial 2,000-round run was interrupted.
Some early samples of the first 200-round special-element run overlapped that process,
so this run was discarded and repeated. Only the complete replacement run and the
complete larger-file run are reported. Do not compare these absolute counts with
earlier runs under different host load or round counts.

Each cache sample runs three rounds, with twelve samples per population and model.
The models are the same as in the earlier cache locality experiment. Positive changes
below mean increases. Model misses are not hardware cache misses.

| Model / population | Instruction change | L1 instruction miss change | Total L1 data miss change |
|---|---:|---:|---:|
| 64-byte / special elements | -3.20% | -0.44% | +2.35% |
| 64-byte / larger files | -1.43% | -1.44% | -0.86% |
| 128-byte / special elements | -3.20% | +4.77% | +2.41% |
| 128-byte / larger files | -1.43% | +2.22% | -3.69% |

The `Kind` read path's attributed instructions fall from 4,490,406 to 3,594,918
over three special-element rounds. The whole process matters for the decision.
All 164 outputs match the baseline byte for byte and official Svelte 5.57.1 as ASTs.
Hardware cache misses, heap allocation changes and peak RSS are `UNMEASURED` for this
candidate. No payload type changes.

## Changes kept in the repository

All three counter backends share workload output checks. `expect_stdout` checks the
population and round count; `minimum_output_bytes` rejects empty output. The real
macOS counter test accepts work, rejects a deliberately empty workload, and verifies
that a failed run cannot reuse a complete report.

The JS output test builds 968 binary expression trees without source parentheses,
prints and parses them, and checks that their operator and child structure survives.
A deliberately wrong binary precedence makes it fail. Restoring the code makes it pass.

The shared layout example is named `repo_layout`, so other crates' `layout` examples
cannot overwrite its executable. The mise task and CI use this name.
